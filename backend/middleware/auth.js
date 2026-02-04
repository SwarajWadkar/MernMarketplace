const User = require('../models/User');
const AppError = require('../utils/AppError');
const { verifyAccessToken, verifyRefreshToken, generateAccessToken } = require('../utils/jwt');

const protect = async (req, res, next) => {
  try {
    let token = null;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized to access this route', 401));
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return next(new AppError('Token is invalid or expired', 401));
    }

    req.user = await User.findById(decoded.userId);

    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    if (req.user.isBlocked) {
      return next(new AppError('Your account has been blocked', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Not authorized to access this route', 403));
    }
    next();
  };
};

module.exports = { protect, authorize };
