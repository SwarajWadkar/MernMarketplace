const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: 1,
      max: 5
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      maxlength: 100
    },
    comment: {
      type: String,
      required: [true, 'Please provide a comment'],
      maxlength: 1000
    },
    helpful: {
      type: Number,
      default: 0
    },
    images: [String],
    verified: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Index for fast lookup
reviewSchema.index({ product: 1, rating: 1 });
reviewSchema.index({ seller: 1 });
reviewSchema.index({ reviewer: 1 });

module.exports = mongoose.model('Review', reviewSchema);
