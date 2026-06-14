import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    heading: { type: String, default: 'Reveal Your Natural Glow' },
    headingHighlight: { type: String, default: 'Natural' },
    subheading: { type: String, default: 'Discover premium skincare crafted with clean, effective ingredients. Nourish your skin and embrace the radiance you deserve.' },
    badgeText: { type: String, default: 'New Collection' },
    ctaPrimary: { type: String, default: 'Shop Now' },
    ctaSecondary: { type: String, default: 'Watch Video' },
    discountValue: { type: String, default: '20%' },
    discountLabel: { type: String, default: 'OFF' },
    discountSub: { type: String, default: 'For New Customers' },

    // Hero image — binary
    imageData: { type: Buffer },
    imageContentType: { type: String },

    // Promo section text
    promoHeading: { type: String, default: 'Skincare That Loves You Back' },
    promoOffer: { type: String, default: 'Flat 20% off on your first order' },

    // Promo image — binary
    promoImageData: { type: Buffer },
    promoImageContentType: { type: String },

    singleton: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models?.Banner || mongoose.model('Banner', bannerSchema);
