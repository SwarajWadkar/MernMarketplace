const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    isWinningBid: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['active', 'outbid', 'won', 'cancelled'],
      default: 'active'
    }
  },
  { timestamps: true }
);

// Index for fast lookup
bidSchema.index({ product: 1, createdAt: -1 });
bidSchema.index({ bidder: 1 });
bidSchema.index({ product: 1, amount: -1 });

module.exports = mongoose.model('Bid', bidSchema);
