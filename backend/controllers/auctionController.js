const Bid = require('../models/Bid');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

exports.placeBid = asyncHandler(async (req, res, next) => {
  const { productId, amount } = req.body;

  const product = await Product.findById(productId);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  if (!product.isAuction) {
    return next(new AppError('This product is not an auction', 400));
  }

  const now = new Date();
  if (product.auctionEndDate < now) {
    return next(new AppError('Auction has ended', 400));
  }

  if (product.auctionStartDate > now) {
    return next(new AppError('Auction has not started yet', 400));
  }

  // Validate bid amount
  const minimumBid = product.currentBidAmount ? product.currentBidAmount * 1.05 : product.auctionStartPrice;

  if (amount < minimumBid) {
    return next(new AppError(`Bid must be at least ${minimumBid}`, 400));
  }

  // Save previous bid as outbid if exists
  if (product.currentBidder) {
    await Bid.findOneAndUpdate(
      { product: productId, bidder: product.currentBidder, status: 'active' },
      { status: 'outbid' }
    );
  }

  // Create new bid
  const bid = await Bid.create({
    product: productId,
    bidder: req.user._id,
    amount,
    status: 'active'
  });

  // Update product with current bid
  product.currentBidAmount = amount;
  product.currentBidder = req.user._id;

  await product.save();

  res.status(201).json({
    success: true,
    message: 'Bid placed successfully',
    bid,
    currentBidAmount: product.currentBidAmount
  });
});

exports.getBids = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const bids = await Bid.find({ product: productId, status: { $in: ['active', 'won'] } })
    .populate('bidder', 'name email')
    .sort('-amount');

  res.status(200).json({
    success: true,
    bids
  });
});

exports.getUserBids = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const skip = (page - 1) * limit;

  const bids = await Bid.find({ bidder: req.user._id })
    .populate('product', 'name images price isAuction auctionEndDate')
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Bid.countDocuments({ bidder: req.user._id });

  res.status(200).json({
    success: true,
    bids,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Admin function to end auctions (can be scheduled as cron job)
exports.endAuction = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  if (!product.isAuction || product.auctionEnded) {
    return next(new AppError('Invalid auction', 400));
  }

  // Mark winning bid
  if (product.currentBidder) {
    await Bid.findOneAndUpdate(
      { product: productId, bidder: product.currentBidder },
      { status: 'won', isWinningBid: true }
    );
  }

  product.auctionEnded = true;
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Auction ended successfully',
    winner: product.currentBidder,
    winningBid: product.currentBidAmount
  });
});
