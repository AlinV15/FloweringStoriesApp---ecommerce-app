import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['book', 'stationary', 'flower'],
    required: true
  },
  refId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'typeRef'
  },
  typeRef: {
    type: String,
    required: true,
    enum: ['Book', 'Stationary', 'Flower']
  },
  price: Number,
  name: String,
  discount: Number,
  Description: String,
  subcategories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subcategory'
    }
  ],
  image: String,
  stock: Number,
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    }
  ],

}, { timestamps: true });


export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
