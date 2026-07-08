import { Response } from 'express';
import Course from '../models/Course';
import { Module, Lesson } from '../models/Module';
import { AuthRequest } from '../middleware/auth';
import { AppError, catchAsync } from '../middleware/errorHandler';

export const getAllCourses = catchAsync(async (req: AuthRequest, res: Response) => {
  const { career, difficulty, published } = req.query;
  const filter: any = {};

  if (career) filter.career = career;
  if (difficulty) filter.difficulty = difficulty;
  if (published !== undefined) filter.isPublished = published === 'true';

  const courses = await Course.find(filter)
    .populate('instructor', 'firstName lastName profileImage')
    .populate('career', 'title')
    .sort({ createdAt: -1 });

  res.json(courses);
});

export const getCourseById = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const course = await Course.findById(id)
    .populate('instructor', 'firstName lastName profileImage bio')
    .populate('career')
    .populate({
      path: 'modules',
      populate: { path: 'lessons' },
    });

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  res.json(course);
});

export const createCourse = catchAsync(async (req: AuthRequest, res: Response) => {
  const { title, description, career, duration, difficulty, thumbnail, price } = req.body;

  if (!title || !description || !career || !duration || !difficulty) {
    throw new AppError('Missing required fields', 400);
  }

  const course = new Course({
    title,
    description,
    career,
    duration,
    difficulty,
    thumbnail,
    price,
    instructor: req.userId,
  });

  await course.save();
  await course.populate('instructor', 'firstName lastName profileImage');

  res.status(201).json(course);
});

export const updateCourse = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const course = await Course.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }).populate('instructor');

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  res.json(course);
});

export const deleteCourse = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const course = await Course.findByIdAndDelete(id);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  res.json({ message: 'Course deleted successfully' });
});

export const publishCourse = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const course = await Course.findByIdAndUpdate(id, { isPublished: true }, { new: true });

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  res.json({ message: 'Course published successfully', course });
});
