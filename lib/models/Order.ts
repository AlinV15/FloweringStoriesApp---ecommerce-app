import mongoose from 'mongoose';


const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem' }],
  address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
  totalAmount: Number,
  guestEmail: { type: String }, // opțional
  guestName: { type: String },  // opțional
  paymentMethod: String,
  payment: {
    stripePaymentIntentId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'ron' },
    status: {
      type: String,
      enum: ['succeeded', 'processing', 'requires_payment_method', 'canceled'],
      default: 'processing'
    },
    method: String
  },
  status: {
    type: String,
    enum: ['pending', 'shipped', 'delivered'],
    default: 'pending'
  },
  deliveryMethod: {
    type: String,
    enum: ['courier', 'pickup'],
    default: 'courier'
  },
  note: { type: String },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
