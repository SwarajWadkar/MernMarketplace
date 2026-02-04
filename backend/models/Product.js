const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      required: [true, 'Please provide a description']
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: 0
    },
    originalPrice: {
      type: Number,
      default: null
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: ['Electronics', 'Fashion', 'Books', 'Home', 'Sports', 'Toys', 'Other']
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    images: [
      {
        url: String,
        publicId: String
      }
    ],
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    isAuction: {
      type: Boolean,
      default: false
    },
    auctionStartPrice: {
      type: Number,
      default: null
    },
    auctionStartDate: {
      type: Date,
      default: null
    },
    auctionEndDate: {
      type: Date,
      default: null
    },
    auctionEnded: {
      type: Boolean,
      default: false
    },
    currentBidAmount: {
      type: Number,
      default: null
    },
    currentBidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    tags: [String],
    specifications: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

// Create text index for search
productSchema.index({ name: 'text', description: 'text', category: 'text' });
productSchema.index({ seller: 1, isActive: 1 });
productSchema.index({ isAuction: 1, auctionEndDate: 1 });

module.exports = mongoose.model('Product', productSchema);
