// lib/models/CustomerProfile.js
import mongoose from 'mongoose';

const CustomerProfileSchema = new mongoose.Schema({
    // Link to User if registered, null if guest
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // Customer Information (always stored here for orders)
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },

    // Default delivery address
    defaultAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },

    // All addresses used by this customer
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }],

    // Order history
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],

    // Marketing preferences
    newsletter: { type: Boolean, default: false },
    marketingConsent: { type: Boolean, default: false },

    // Customer insights
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastOrderDate: { type: Date },

    // Guest customer tracking (for non-registered users)
    isGuest: { type: Boolean, default: false },

}, { timestamps: true });

// Compound index for guest customers
CustomerProfileSchema.index({ email: 1, isGuest: 1 });
CustomerProfileSchema.index({ user: 1 });

// Pre-save hook to update order statistics
CustomerProfileSchema.pre('save', async function (next) {
    if (this.isModified('orders')) {
        // This could be populated in a background job for better performance
        this.totalOrders = this.orders.length;
    }
    next();
});

export default mongoose.models.CustomerProfile || mongoose.model('CustomerProfile', CustomerProfileSchema);