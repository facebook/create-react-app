import { Response } from 'express';
import User from '../models/User';
import Enrollment from '../models/Enrollment';
import { AuthRequest } from '../middleware/auth';
import { AppError, catchAsync } from '../middleware/errorHandler';

export const getProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId)
    .select('-password')
    .populate('enrolledCareers', 'title icon')
    .populate('completedCourses', 'title thumbnail')
    .populate('certificates');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json(user);
});

export const updateProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  const { firstName, lastName, bio, phone, profileImage } = req.body;

  const user = await User.findByIdAndUpdate(
    req.userId,
    { firstName, lastName, bio, phone, profileImage },
    { new: true }
  ).select('-password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json(user);
});

export const enrollInCourse = catchAsync(async (req: AuthRequest, res: Response) => {
  const { courseId, careerId } = req.body;

  if (!courseId) {
    throw new AppError('Course ID is required', 400);
  }

  let enrollment = await Enrollment.findOne({ user: req.userId, course: courseId });
  if (enrollment) {
    throw new AppError('Already enrolled in this course', 409);
  }

  enrollment = new Enrollment({
    user: req.userId,
    course: courseId,
    career: careerId,
  });

  await enrollment.save();

  await User.findByIdAndUpdate(req.userId, { $push: { enrolledCareers: careerId } }, { new: true });

  res.status(201).json({ message: 'Enrolled successfully', enrollment });
});

export const getEnrollments = catchAsync(async (req: AuthRequest, res: Response) => {
  const enrollments = await Enrollment.find({ user: req.userId })
    .populate('course', 'title thumbnail duration difficulty')
    .populate('career', 'title');

  res.json(enrollments);
});
