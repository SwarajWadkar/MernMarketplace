const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Generate unique order number
const generateOrderNumber = () => {
  return 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
};

exports.createOrder = asyncHandler(async (req, res, next) => {
  const { shippingAddress, shippingCost = 0 } = req.body;
  
  console.log('Creating order for user:', req.user._id);
  console.log('Shipping address:', shippingAddress);

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    console.log('Cart is empty for user:', req.user._id);
    return next(new AppError('Cart is empty', 400));
  }

  console.log('Cart items:', cart.items.length);

  // Check stock for all items
  for (let item of cart.items) {
    const product = await Product.findById(item.product._id);
    if (!product) {
      console.log('Product not found:', item.product._id);
      return next(new AppError(`Product not found`, 400));
    }
    if (product.stock < item.quantity) {
      console.log(`Insufficient stock for ${product.name}. Need: ${item.quantity}, Available: ${product.stock}`);
      return next(new AppError(`Insufficient stock for ${product.name}`, 400));
    }
  }

  // Calculate order
  const items = cart.items.map((item) => ({
    product: item.product._id,
    seller: item.product.seller,
    quantity: item.quantity,
    price: item.price
  }));

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% tax
  const totalAmount = subtotal + shippingCost + tax;

  console.log('Order calculation:', { subtotal, tax, shippingCost, totalAmount });

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    buyer: req.user._id,
    items,
    shippingAddress,
    shippingCost,
    tax,
    totalAmount,
    paymentStatus: 'pending'
  });

  console.log('Order created successfully:', order._id);

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    order
  });
});

exports.getOrders = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;

  let query = { buyer: req.user._id };

  if (status) {
    query.orderStatus = status;
  }

  const skip = (page - 1) * limit;

  const orders = await Order.find(query)
    .populate('items.product', 'name images price')
    .populate('items.seller', 'name email')
    .populate('buyer', 'name email phone')
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Order.countDocuments(query);

  res.status(200).json({
    success: true,
    orders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('items.product')
    .populate('items.seller', 'name email phone businessName')
    .populate('buyer', 'name email phone');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Check if user is buyer or admin
  if (order.buyer._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  res.status(200).json({
    success: true,
    order
  });
});

exports.getSellerOrders = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;

  let query = { 'items.seller': req.user._id };

  if (status) {
    query.orderStatus = status;
  }

  const skip = (page - 1) * limit;

  const orders = await Order.find(query)
    .populate('items.product', 'name images')
    .populate('buyer', 'name email phone')
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Order.countDocuments(query);

  res.status(200).json({
    success: true,
    orders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { orderStatus } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (orderStatus === 'delivered') {
    order.deliveredAt = new Date();
  }

  order.orderStatus = orderStatus;
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order status updated',
    order
  });
});

exports.processPayment = asyncHandler(async (req, res, next) => {
  const { orderId, paymentIntentId } = req.body;

  console.log('Processing payment for order:', orderId);

  const order = await Order.findById(orderId);

  if (!order) {
    console.log('Order not found:', orderId);
    return next(new AppError('Order not found', 404));
  }

  order.stripePaymentIntentId = paymentIntentId;
  order.paymentStatus = 'completed';
  order.orderStatus = 'confirmed';

  // Reduce product stock
  for (let item of order.items) {
    console.log(`Reducing stock for product ${item.product} by ${item.quantity}`);
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity }
    });
  }

  // Clear cart
  await Cart.deleteOne({ user: order.buyer });

  await order.save();

  console.log('Payment processed successfully for order:', orderId);

  res.status(200).json({
    success: true,
    message: 'Payment processed successfully',
    order
  });
});
