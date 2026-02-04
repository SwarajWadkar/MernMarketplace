const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessage = errors.array().map((err) => err.msg).join(', ');
    console.log('Validation errors:', errorMessage);
    return res.status(400).json({
      success: false,
      message: errorMessage,
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['buyer', 'seller']).withMessage('Role must be buyer or seller')
];

const loginValidator = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const productValidator = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
];

const cartValidator = [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

const reviewValidator = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('comment').trim().notEmpty().withMessage('Comment is required')
];

const auctionValidator = [
  body('auctionStartPrice').isFloat({ min: 0 }).withMessage('Start price must be positive'),
  body('auctionStartDate').isISO8601().withMessage('Invalid start date'),
  body('auctionEndDate').isISO8601().withMessage('Invalid end date')
];

module.exports = {
  validate,
  registerValidator,
  loginValidator,
  productValidator,
  cartValidator,
  reviewValidator,
  auctionValidator
};
