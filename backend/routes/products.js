const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  uploadProductImages,
  deleteProductImage
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { productValidator, validate } = require('../middleware/validators');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected routes - Seller/Admin
router.post('/', protect, authorize('seller', 'admin'), productValidator, validate, createProduct);
router.put('/:id', protect, authorize('seller', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('seller', 'admin'), deleteProduct);

// Seller products
router.get('/seller/products', protect, authorize('seller'), getSellerProducts);

// Image upload
router.post('/:id/images', protect, authorize('seller', 'admin'), uploadProductImages);
router.delete('/:id/images', protect, authorize('seller', 'admin'), deleteProductImage);

module.exports = router;
