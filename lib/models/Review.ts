import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  user: String,
  product: String,
  rating: Number,
  comment: String,
}, { timestamps: true });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
