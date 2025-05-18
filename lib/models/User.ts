import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  birthDate: Date,
  genre: String,
  favoriteProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: false },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
