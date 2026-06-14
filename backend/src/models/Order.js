import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    image: String,
    price: Number,
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending_payment', 'paid', 'approved', 'shipped', 'cancelled'],
      default: 'pending_payment',
    },
    paymentMethod: { type: String, enum: ['stripe', 'demo'], default: 'stripe' },
    stripeSessionId: String,
    stripePaymentIntentId: String,
    shippingAddress: {
      fullName: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      zip: String,
    },
    receiptSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

orderSchema.pre('save', async function (next) {
  if (this.orderNumber) return next();
  const count = await mongoose.model('Order').countDocuments();
  this.orderNumber = `GLW-${Date.now().toString(36).toUpperCase()}-${(count + 1).toString().padStart(4, '0')}`;
  next();
});

export default mongoose.model('Order', orderSchema);
