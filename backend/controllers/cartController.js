const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

exports.getCart = asyncHandler(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

  if (!cart) {
    cart = await Cart.create({ user: req.user._id });
  }

  res.status(200).json({
    success: true,
    cart
  });
});

exports.addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  if (product.stock < quantity) {
    return next(new AppError('Insufficient stock', 400));
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id });
  }

  // Check if item already in cart
  const existingItem = cart.items.find((item) => item.product.toString() === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      product: productId,
      quantity,
      price: product.price
    });
  }

  cart.calculateTotals();
  await cart.save();

  await cart.populate('items.product');

  res.status(200).json({
    success: true,
    message: 'Item added to cart',
    cart
  });
});

exports.removeFromCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  cart.items = cart.items.filter((item) => item.product.toString() !== productId);

  cart.calculateTotals();
  await cart.save();

  await cart.populate('items.product');

  res.status(200).json({
    success: true,
    message: 'Item removed from cart',
    cart
  });
});

exports.updateCartItem = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;

  if (quantity < 1) {
    return next(new AppError('Quantity must be at least 1', 400));
  }

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  if (product.stock < quantity) {
    return next(new AppError('Insufficient stock', 400));
  }

  const item = cart.items.find((item) => item.product.toString() === productId);

  if (!item) {
    return next(new AppError('Item not found in cart', 404));
  }

  item.quantity = quantity;
  item.price = product.price;

  cart.calculateTotals();
  await cart.save();

  await cart.populate('items.product');

  res.status(200).json({
    success: true,
    message: 'Cart updated',
    cart
  });
});

exports.clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  cart.items = [];
  cart.calculateTotals();
  await cart.save();

  res.status(200).json({
    success: true,
    message: 'Cart cleared'
  });
});
