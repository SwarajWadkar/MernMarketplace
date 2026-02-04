const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, phone } = req.body;
  
  console.log('Register request received:', { name, email, role });

  // Check if user already exists
  let user = await User.findOne({ email });
  if (user) {
    console.log('User already exists:', email);
    return next(new AppError('Email already registered', 400));
  }

  // Create user
  user = await User.create({
    name,
    email,
    password,
    role: role || 'buyer',
    phone
  });
  
  console.log('User created successfully:', user._id);

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token in database
  user.refreshToken = refreshToken;
  await user.save();

  // Send tokens in cookies
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  
  console.log('Login request received:', { email });

  // Validate inputs
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Check for user (select password because it's not selected by default)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    console.log('User not found:', email);
    return next(new AppError('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    console.log('Password mismatch for user:', email);
    return next(new AppError('Invalid credentials', 401));
  }

  if (user.isBlocked) {
    console.log('Account is blocked:', email);
    return next(new AppError('Your account has been blocked', 403));
  }

  console.log('User authenticated successfully:', email);

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save();

  // Send refresh token in cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

exports.refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new AppError('Refresh token not provided', 401));
  }

  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    return next(new AppError('Invalid refresh token', 401));
  }

  // Check if user exists and refresh token matches
  const user = await User.findById(decoded.userId).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) {
    return next(new AppError('Invalid refresh token', 401));
  }

  // Generate new tokens
  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await user.save();

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.status(200).json({
    success: true,
    accessToken: newAccessToken
  });
});

exports.logout = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  user.refreshToken = null;
  await user.save();

  res.clearCookie('refreshToken');
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

exports.getCurrentUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      address: user.address,
      profileImage: user.profileImage,
      businessName: user.businessName,
      businessDescription: user.businessDescription
    }
  });
});

exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone, address, businessName, businessDescription } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      name,
      phone,
      address,
      businessName,
      businessDescription
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user
  });
});
