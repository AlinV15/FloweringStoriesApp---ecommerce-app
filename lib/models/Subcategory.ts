import mongoose from 'mongoose';

const SubcategorySchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  type: {
    type: String,
    enum: ['book', 'stationary', 'flower'],
    required: true
  }
}, { timestamps: true });

export default mongoose.models.Subcategory || mongoose.model('Subcategory', SubcategorySchema);
