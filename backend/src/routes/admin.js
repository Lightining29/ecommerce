import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Banner from '../models/Banner.js';
import Contact from '../models/Contact.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { enrichProduct } from '../utils/pricing.js';

const router = express.Router();
router.use(protect, adminOnly);

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/* ─── ANALYTICS ─────────────────────────────────────────────────── */
router.get('/analytics', async (_req, res) => {
  try {
    const [totalOrders, totalProducts, totalUsers, revenueAgg, recentOrders, topProducts] =
      await Promise.all([
        Order.countDocuments({ status: { $in: ['paid', 'approved', 'shipped'] } }),
        Product.countDocuments(),
        User.countDocuments({ role: 'user' }),
        Order.aggregate([
          { $match: { status: { $in: ['paid', 'approved', 'shipped'] } } },
          { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
        Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5),
        Order.aggregate([
          { $match: { status: { $in: ['paid', 'approved', 'shipped'] } } },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.product',
              name: { $first: '$items.name' },
              sold: { $sum: '$items.quantity' },
              revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            },
          },
          { $sort: { sold: -1 } },
          { $limit: 5 },
        ]),
      ]);

    const pendingApproval = await Order.countDocuments({ status: 'paid' });
    const lowStock = await Product.find({ stockQuantity: { $lte: 10 } })
      .select('name stockQuantity')
      .limit(5);

    res.json({
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue: revenueAgg[0]?.total || 0,
      pendingApproval,
      recentOrders,
      topProducts,
      lowStock,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─── PRODUCTS ───────────────────────────────────────────────────── */
router.get('/products', async (_req, res) => {
  try {
    const products = await Product.find()
      .select('-imageData -imageContentType') // never send binary to listing
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });
    res.json(products.map(enrichProduct));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create product — accepts multipart/form-data with an "image" file field
router.post('/products', upload.single('image'), async (req, res) => {
  try {
    const {
      name, description, price, originalPrice,
      category, stockQuantity, discountPercent, bestseller,
    } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Product image is required' });
    }

    const slug = slugify(name);
    const exists = await Product.findOne({ slug });
    if (exists) return res.status(400).json({ message: 'Product with similar name exists' });

    const qty = parseInt(stockQuantity ?? 50, 10);
    const product = await Product.create({
      name,
      slug,
      description,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      imageData: req.file.buffer,
      imageContentType: req.file.mimetype,
      category,
      stockQuantity: qty,
      discountPercent: parseInt(discountPercent ?? 0, 10),
      bestseller: bestseller === 'true' || bestseller === true,
      inStock: qty > 0,
    });

    res.status(201).json(enrichProduct(product));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update product — image is optional
router.put('/products/:id', upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Parse numeric fields sent as form strings
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.originalPrice) updateData.originalPrice = parseFloat(updateData.originalPrice);
    if (updateData.stockQuantity !== undefined) updateData.stockQuantity = parseInt(updateData.stockQuantity, 10);
    if (updateData.discountPercent !== undefined) updateData.discountPercent = parseInt(updateData.discountPercent, 10);
    if (updateData.bestseller !== undefined) updateData.bestseller = updateData.bestseller === 'true' || updateData.bestseller === true;

    // If a new image was uploaded, update binary fields
    if (req.file) {
      updateData.imageData = req.file.buffer;
      updateData.imageContentType = req.file.mimetype;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('category', 'name slug');

    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (updateData.stockQuantity !== undefined) {
      product.inStock = product.stockQuantity > 0;
      await product.save();
    }

    res.json(enrichProduct(product));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/products/:id/stock', async (req, res) => {
  try {
    const { stockQuantity } = req.body;
    if (stockQuantity === undefined || stockQuantity < 0) {
      return res.status(400).json({ message: 'Valid stock quantity required' });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stockQuantity, inStock: stockQuantity > 0 },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(enrichProduct(product));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/products/:id/discount', async (req, res) => {
  try {
    const { discountPercent } = req.body;
    if (discountPercent === undefined || discountPercent < 0 || discountPercent > 100) {
      return res.status(400).json({ message: 'Discount must be 0–100' });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (discountPercent > 0 && !product.originalPrice) {
      product.originalPrice = product.price;
    }
    product.discountPercent = discountPercent;
    await product.save();
    res.json(enrichProduct(product));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─── CATEGORIES ─────────────────────────────────────────────────── */
router.get('/categories', async (_req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    // map to include versioned image URL when binary exists
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

// Create category (accepts optional image upload)
router.post('/categories', upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const slug = slugify(name);
    const exists = await Category.findOne({ slug });
    if (exists) return res.status(400).json({ message: 'Category with same name exists' });

    const category = new Category({ name, slug });
    if (req.file) {
      category.imageData = req.file.buffer;
      category.imageContentType = req.file.mimetype;
    }
    await category.save();

    const obj = category.toObject();
    const v = category.updatedAt ? category.updatedAt.getTime() : Date.now();
    obj.imageUrl = category.imageData ? `/api/images/category/${category._id}?v=${v}` : (category.image || null);
    delete obj.imageData;
    delete obj.imageContentType;

    res.status(201).json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update category
router.put('/categories/:id', upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    if (name) {
      category.name = name;
      category.slug = slugify(name);
    }
    if (req.file) {
      category.imageData = req.file.buffer;
      category.imageContentType = req.file.mimetype;
    }
    category.updatedAt = new Date();
    await category.save();

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

// Delete category
router.delete('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─── ORDERS ─────────────────────────────────────────────────────── */
router.get('/orders', async (_req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/orders/:id/approve', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'paid') {
      return res.status(400).json({ message: 'Only paid orders can be approved' });
    }
    order.status = 'approved';
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/orders/:id/ship', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'approved') {
      return res.status(400).json({ message: 'Only approved orders can be shipped' });
    }
    order.status = 'shipped';
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─── CONTACTS ─────────────────────────────────────────────────── */
router.get('/contacts', async (_req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/contacts/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/contacts/:id/read', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    contact.read = true;
    await contact.save();
    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/contacts/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json({ message: 'Contact deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─── BANNER ─────────────────────────────────────────────────────── */
function bannerImageUrls(banner) {
  const v = banner.updatedAt ? banner.updatedAt.getTime() : Date.now();
  return {
    imageUrl:      banner.imageContentType      ? `/api/images/banner/hero?v=${v}`  : null,
    promoImageUrl: banner.promoImageContentType ? `/api/images/banner/promo?v=${v}` : null,
  };
}

router.get('/banner', async (_req, res) => {
  try {
    let banner = await Banner.findOne({ singleton: true }).select('-imageData -promoImageData');
    if (!banner) banner = await Banner.create({ singleton: true });
    const obj = banner.toObject();
    Object.assign(obj, bannerImageUrls(banner));
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update banner — accepts multipart/form-data with optional "image" and "promoImage" files
router.put(
  '/banner',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'promoImage', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // Debug: log incoming files (helps diagnose missing uploads/file size issues)
      console.log('Admin banner upload - files:', Object.keys(req.files || {}).reduce((acc, k) => {
        const f = req.files[k] && req.files[k][0];
        acc[k] = f ? { originalname: f.originalname, size: f.size, mimetype: f.mimetype } : null;
        return acc;
      }, {}));

      const textFields = { ...req.body };
      // Remove any accidental buffer-related keys from body
      delete textFields.imageData;
      delete textFields.promoImageData;

      // Find or create banner document and assign fields so Mongoose handles Buffers/timestamps correctly
      let banner = await Banner.findOne({ singleton: true });
      if (!banner) banner = new Banner({ singleton: true });

      // Apply text fields
      Object.entries(textFields).forEach(([k, v]) => {
        // avoid setting empty string values for binary fields
        banner[k] = v;
      });

      if (req.files?.image?.[0]) {
        banner.imageData = req.files.image[0].buffer;
        banner.imageContentType = req.files.image[0].mimetype;
      }
      if (req.files?.promoImage?.[0]) {
        banner.promoImageData = req.files.promoImage[0].buffer;
        banner.promoImageContentType = req.files.promoImage[0].mimetype;
      }

      // Ensure updatedAt changes to bust caches
      banner.updatedAt = new Date();

      await banner.save();

      // Build response without binary data
      const obj = banner.toObject();
      delete obj.imageData;
      delete obj.promoImageData;
      Object.assign(obj, bannerImageUrls(banner));
      res.json(obj);
    } catch (err) {
      console.error('Failed saving banner:', err);
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;
