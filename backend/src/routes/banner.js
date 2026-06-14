import express from 'express';
import Banner from '../models/Banner.js';

const router = express.Router();

function buildImageUrls(banner) {
  const v = banner.updatedAt ? banner.updatedAt.getTime() : Date.now();
  return {
    imageUrl:      banner.imageData      ? `/api/images/banner/hero?v=${v}`  : null,
    promoImageUrl: banner.promoImageData ? `/api/images/banner/promo?v=${v}` : null,
  };
}

// Public: get banner text config + versioned image URLs
router.get('/', async (_req, res) => {
  try {
    let banner = await Banner.findOne({ singleton: true });
    if (!banner) {
      banner = await Banner.create({ singleton: true });
    }
    const obj = banner.toObject();
    // Remove binary data before sending to client
    delete obj.imageData;
    delete obj.promoImageData;
    Object.assign(obj, buildImageUrls(banner));
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
