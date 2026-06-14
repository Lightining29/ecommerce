import express from 'express';
import Stripe from 'stripe';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';
import { getFinalPrice } from '../utils/pricing.js';
import { sendOrderReceipt } from '../services/email.js';

const router = express.Router();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function fulfillOrder(order) {
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product) {
      product.stockQuantity = Math.max(0, product.stockQuantity - item.quantity);
      product.inStock = product.stockQuantity > 0;
      await product.save();
    }
  }
  if (!order.receiptSent) {
    await sendOrderReceipt(order, order.shippingAddress?.email);
    order.receiptSent = true;
    await order.save();
  }
}

export async function stripeWebhookHandler(req, res) {
  if (!stripe) return res.status(400).send('Stripe not configured');

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const order = await Order.findById(session.metadata.orderId);
    if (order && order.status === 'pending_payment') {
      order.status = 'paid';
      order.stripeSessionId = session.id;
      order.stripePaymentIntentId = session.payment_intent;
      await order.save();
      await fulfillOrder(order);
    }
  }

  res.json({ received: true });
}

router.post('/checkout', protect, async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;
    if (!items?.length) return res.status(400).json({ message: 'Cart is empty' });
    if (!shippingAddress?.fullName || !shippingAddress?.email || !shippingAddress?.address) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId || item._id);
      if (!product) return res.status(400).json({ message: `Product not found: ${item.name || item.productId}` });
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      const price = getFinalPrice(product);
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price,
        quantity: item.quantity,
      });
      subtotal += price * item.quantity;
    }

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      subtotal,
      total: subtotal,
      shippingAddress,
      status: 'pending_payment',
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    if (stripe) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: shippingAddress.email,
        line_items: orderItems.map((item) => ({
          price_data: {
            currency: 'usd',
            product_data: { name: item.name, images: [item.image] },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })),
        success_url: `${clientUrl}/checkout/success?orderId=${order._id}`,
        cancel_url: `${clientUrl}/checkout?cancelled=true`,
        metadata: { orderId: order._id.toString() },
      });

      order.stripeSessionId = session.id;
      order.paymentMethod = 'stripe';
      await order.save();

      return res.json({ orderId: order._id, sessionUrl: session.url, demo: false });
    }

    res.json({ orderId: order._id, demo: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/demo-pay/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'pending_payment') {
      return res.status(400).json({ message: 'Order already processed' });
    }

    order.status = 'paid';
    order.paymentMethod = 'demo';
    await order.save();
    await fulfillOrder(order);

    res.json({ message: 'Payment successful', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
