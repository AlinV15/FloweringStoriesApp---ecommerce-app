import mongoose from 'mongoose';
import { stringifyResumeDataCache } from 'next/dist/server/resume-data-cache/resume-data-cache';

const FlowerSchema = new mongoose.Schema({
  color: String,
  freshness: Number,
  lifespan: Number,
  season: String,
  careInstructions: String,
  expiryDate: Date
});

export default mongoose.models.Flower || mongoose.model('Flower', FlowerSchema);
