import { Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { AppError, catchAsync } from '../middleware/errorHandler';

export const register = catchAsync(async (req: AuthRequest, res: Response) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    throw new AppError('All fields are required', 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User already exists', 409);
  }

  const user = new User({ email, password, firstName, lastName });
  await user.save();

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production',
    { expiresIn: process.env.JWT_EXPIRATION || '7d' }
  );

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName },
  });
});

export const login = catchAsync(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production',
    { expiresIn: process.env.JWT_EXPIRATION || '7d' }
  );

  res.json({
    message: 'Login successful',
    token,
    user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName },
  });
});

export const getCurrentUser = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId).select('-password');
  if (!user) {
    throw new AppError('User not found', 404);
  }
  res.json(user);
});
