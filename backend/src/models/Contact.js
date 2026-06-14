import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    ip: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models?.Contact || mongoose.model('Contact', contactSchema);
