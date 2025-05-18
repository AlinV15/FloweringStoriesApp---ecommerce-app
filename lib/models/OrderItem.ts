import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: Number,
  lineAmount: Number,
}, { timestamps: true });

export default mongoose.models.OrderItem || mongoose.model('OrderItem', OrderItemSchema);
