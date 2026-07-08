import { Response } from 'express';
import Career from '../models/Career';
import Course from '../models/Course';
import { AuthRequest } from '../middleware/auth';
import { AppError, catchAsync } from '../middleware/errorHandler';

export const getAllCareers = catchAsync(async (req: AuthRequest, res: Response) => {
  const { featured } = req.query;
  const filter = featured === 'true' ? { featured: true } : {};

  const careers = await Career.find(filter).populate('courses').sort({ createdAt: -1 });
  res.json(careers);
});

export const getCareerById = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const career = await Career.findById(id).populate({
    path: 'courses',
    populate: { path: 'modules' },
  });

  if (!career) {
    throw new AppError('Career not found', 404);
  }

  res.json(career);
});

export const createCareer = catchAsync(async (req: AuthRequest, res: Response) => {
  const { title, description, icon, duration, difficulty, skills, prerequisites, salaryRange, jobMarketDemand } = req.body;

  if (!title || !description || !duration || !difficulty) {
    throw new AppError('Missing required fields', 400);
  }

  const career = new Career({
    title,
    description,
    icon,
    duration,
    difficulty,
    skills,
    prerequisites,
    salaryRange,
    jobMarketDemand,
  });

  await career.save();
  res.status(201).json(career);
});

export const updateCareer = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const career = await Career.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

  if (!career) {
    throw new AppError('Career not found', 404);
  }

  res.json(career);
});

export const deleteCareer = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const career = await Career.findByIdAndDelete(id);

  if (!career) {
    throw new AppError('Career not found', 404);
  }

  res.json({ message: 'Career deleted successfully' });
});
