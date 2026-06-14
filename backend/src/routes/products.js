import express from 'express';
import Product from '../models/Product.js';
import { enrichProduct } from '../utils/pricing.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, bestseller, limit } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (bestseller === 'true') filter.bestseller = true;

    let query = Product.find(filter)
      .select('-imageData -imageContentType')
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });
    if (limit) query = query.limit(parseInt(limit, 10));

    const products = await query;
    res.json(products.map(enrichProduct));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .select('-imageData -imageContentType')
      .populate('category', 'name slug');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(enrichProduct(product));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
