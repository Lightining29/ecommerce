import express from 'express';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { enrichProduct } from '../utils/pricing.js';

const router = express.Router();

router.get('/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'wishlist',
      populate: { path: 'category', select: 'name slug' },
    });
    res.json(user.wishlist.map(enrichProduct));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/wishlist/:productId', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const user = await User.findById(req.user.id);
    if (!user.wishlist.some((id) => id.toString() === product._id.toString())) {
      user.wishlist.push(product._id);
      await user.save();
    }
    res.json({ message: 'Added to wishlist' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/wishlist/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.wishlist = user.wishlist.filter((id) => id.toString() !== req.params.productId);
    await user.save();
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
