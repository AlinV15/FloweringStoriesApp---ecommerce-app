// lib/models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  // Basic Auth Info
  email: { type: String, unique: true, required: true },
  password: { type: String, required: false }, // Optional for OAuth users

  // Personal Information (from checkout form)
  firstName: { type: String },
  lastName: { type: String },
  phone: { type: String }, // Added phone from checkout
  birthDate: { type: Date },
  genre: { type: String },

  // Address Information
  address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },

  // E-commerce Related
  favoriteProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],

  // Newsletter and Marketing
  newsletter: { type: Boolean, default: false }, // From checkout form

  // System
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  // Account Status
  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false },

  resetPasswordToken: {
    type: String,
    required: false
  },
  resetPasswordExpires: {
    type: Date,
    required: false
  },

}, { timestamps: true });

// Index for better performance
UserSchema.index({ role: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);