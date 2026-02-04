const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

exports.createProduct = asyncHandler(async (req, res, next) => {
  const { name, description, price, category, stock, tags, specifications, isAuction, auctionStartPrice, auctionStartDate, auctionEndDate } = req.body;

  const product = await Product.create({
    name,
    description,
    price,
    category,
    stock,
    seller: req.user._id,
    tags,
    specifications,
    isAuction,
    auctionStartPrice: isAuction ? auctionStartPrice : null,
    auctionStartDate: isAuction ? auctionStartDate : null,
    auctionEndDate: isAuction ? auctionEndDate : null,
    images: []
  });

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    product
  });
});

exports.getProducts = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 12, search, category, minPrice, maxPrice, sort = '-createdAt' } = req.query;

  let query = { isActive: true };

  // Search
  if (search) {
    query.$text = { $search: search };
  }

  // Category filter
  if (category && category !== 'all') {
    query.category = category;
  }

  // Price filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  // Pagination
  const skip = (page - 1) * limit;

  const products = await Product.find(query)
    .populate('seller', 'name businessName profileImage averageRating')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('seller', 'name businessName profileImage averageRating businessDescription');

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    product
  });
});

exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check if user is seller or admin
  if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to update this product', 403));
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    product
  });
});

exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check if user is seller or admin
  if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to delete this product', 403));
  }

  await Product.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});

exports.getSellerProducts = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 12, search } = req.query;

  let query = { seller: req.user._id };

  if (search) {
    query.$text = { $search: search };
  }

  const skip = (page - 1) * limit;

  const products = await Product.find(query)
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.uploadProductImages = asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new AppError('No files uploaded', 400));
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  const images = req.files.map((file) => ({
    url: `/uploads/${file.filename}`,
    publicId: file.filename
  }));

  product.images = [...product.images, ...images];
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Images uploaded successfully',
    images
  });
});

exports.deleteProductImage = asyncHandler(async (req, res, next) => {
  const { imagePublicId } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  product.images = product.images.filter((img) => img.publicId !== imagePublicId);
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Image deleted successfully'
  });
});
