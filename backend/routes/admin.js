const express = require('express');
const {
  getAllUsers,
  getUserById,
  blockUser,
  unblockUser,
  getAllProducts,
  approveProduct,
  rejectProduct,
  getOrders,
  getDashboardStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require admin role
router.use(protect, authorize('admin'));

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/block', blockUser);
router.put('/users/:id/unblock', unblockUser);

// Product management
router.get('/products', getAllProducts);
router.put('/products/:id/approve', approveProduct);
router.put('/products/:id/reject', rejectProduct);

// Order management
router.get('/orders', getOrders);

// Dashboard stats
router.get('/dashboard/stats', getDashboardStats);

module.exports = router;
