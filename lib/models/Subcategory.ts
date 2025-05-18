import mongoose from 'mongoose';

const SubcategorySchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String
}, { timestamps: true });

export default mongoose.models.Subcategory || mongoose.model('Subcategory', SubcategorySchema);
