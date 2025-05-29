import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpfulVotes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create compound index to prevent duplicate reviews from same user for same product
ReviewSchema.index({ userId: 1, product: 1 }, { unique: true });

// Create index for efficient queries
ReviewSchema.index({ product: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1 });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);