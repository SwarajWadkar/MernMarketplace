const express = require('express');
const { register, login, refreshToken, logout, getCurrentUser, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerValidator, loginValidator, validate } = require('../middleware/validators');

const router = express.Router();

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateProfile);

module.exports = router;
