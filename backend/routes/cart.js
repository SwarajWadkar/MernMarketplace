const express = require('express');
const {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');
const { cartValidator, validate } = require('../middleware/validators');

const router = express.Router();

router.get('/', protect, getCart);
router.post('/add', protect, cartValidator, validate, addToCart);
router.delete('/remove', protect, removeFromCart);
router.put('/update', protect, cartValidator, validate, updateCartItem);
router.delete('/clear', protect, clearCart);

module.exports = router;
