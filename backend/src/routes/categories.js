import express from 'express';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    const mapped = categories.map((c) => {
      const obj = c.toObject();
      const v = c.updatedAt ? c.updatedAt.getTime() : Date.now();
      obj.imageUrl = c.imageData ? `/api/images/category/${c._id}?v=${v}` : (c.image || null);
      delete obj.imageData;
      delete obj.imageContentType;
      return obj;
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    const obj = category.toObject();
    const v = category.updatedAt ? category.updatedAt.getTime() : Date.now();
    obj.imageUrl = category.imageData ? `/api/images/category/${category._id}?v=${v}` : (category.image || null);
    delete obj.imageData;
    delete obj.imageContentType;
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
