import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    // Optional URL for legacy compatibility
    image: { type: String },
    // Binary image fields stored in MongoDB
    imageData: { type: Buffer },
    imageContentType: { type: String },
    productCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models?.Category || mongoose.model('Category', categorySchema);
