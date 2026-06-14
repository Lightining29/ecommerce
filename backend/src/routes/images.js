import express from 'express';
import Product from '../models/Product.js';
import Banner from '../models/Banner.js';
import Category from '../models/Category.js';

const router = express.Router();

/**
 * GET /api/images/product/:id
 * Serve a product's binary image
 */
router.get('/product/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('imageData imageContentType');
    if (!product || !product.imageData) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.set('Content-Type', product.imageContentType || 'image/jpeg');
    // version query param (?v=...) ensures cache busts on update
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(product.imageData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/images/banner/hero
 * Serve the hero banner image — never cached (always fresh)
 */
router.get('/banner/hero', async (_req, res) => {
  try {
    const banner = await Banner.findOne({ singleton: true }).select('imageData imageContentType');
    if (!banner || !banner.imageData) {
      return res.status(404).json({ message: 'No hero image set' });
    }
    res.set('Content-Type', banner.imageContentType || 'image/jpeg');
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.send(banner.imageData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/images/banner/promo
 * Serve the promo section image — never cached
 */
router.get('/banner/promo', async (_req, res) => {
  try {
    const banner = await Banner.findOne({ singleton: true }).select('promoImageData promoImageContentType');
    if (!banner || !banner.promoImageData) {
      return res.status(404).json({ message: 'No promo image set' });
    }
    res.set('Content-Type', banner.promoImageContentType || 'image/jpeg');
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.send(banner.promoImageData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/**
 * GET /api/images/category/:id
 * Serve a category's binary image
 */
router.get('/category/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).select('imageData imageContentType');
    if (!category || !category.imageData) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.set('Content-Type', category.imageContentType || 'image/jpeg');
    // categories images can be cached
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(category.imageData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
