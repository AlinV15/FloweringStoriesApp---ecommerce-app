import mongoose from 'mongoose';

const dimensionsSchema = new mongoose.Schema({
  height: Number,
  width: Number,
  depth: Number
}, { _id: false });

const StationarySchema = new mongoose.Schema({
  brand: String,
  color: [String],
  type: String,
  price: Number,
  dimensions: dimensionsSchema,
  material: String
});

export default mongoose.models.Stationary || mongoose.model('Stationary', StationarySchema);
