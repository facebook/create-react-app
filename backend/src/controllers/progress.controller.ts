import { Response } from 'express';
import { Progress, LessonProgress } from '../models/Progress';
import { AuthRequest } from '../middleware/auth';
import { AppError, catchAsync } from '../middleware/errorHandler';

export const getCourseProgress = catchAsync(async (req: AuthRequest, res: Response) => {
  const { courseId } = req.params;
  let progress = await Progress.findOne({ user: req.userId, course: courseId })
    .populate('completedLessons')
    .populate('completedModules');

  if (!progress) {
    const newProgress = new Progress({
      user: req.userId,
      course: courseId,
      status: 'not_started',
    });
    await newProgress.save();
    progress = newProgress;
  }

  res.json(progress);
});

export const updateLessonProgress = catchAsync(async (req: AuthRequest, res: Response) => {
  const { courseId, lessonId } = req.params;
  const { watchedDuration, isCompleted } = req.body;

  let lessonProgress = await LessonProgress.findOne({
    user: req.userId,
    lesson: lessonId,
    course: courseId,
  });

  if (!lessonProgress) {
    lessonProgress = new LessonProgress({
      user: req.userId,
      lesson: lessonId,
      course: courseId,
    });
  }

  if (watchedDuration !== undefined) {
    lessonProgress.watchedDuration = watchedDuration;
  }

  if (isCompleted) {
    lessonProgress.isCompleted = true;
    lessonProgress.completedAt = new Date();
  }

  await lessonProgress.save();

  let progress = await Progress.findOne({ user: req.userId, course: courseId });
  if (!progress) {
    progress = new Progress({ user: req.userId, course: courseId });
  }

  progress.lastAccessedAt = new Date();
  progress.status = 'in_progress';

  if (!progress.completedLessons.includes(lessonId) && isCompleted) {
    progress.completedLessons.push(lessonId as any);
  }

  await progress.save();

  res.json({ message: 'Progress updated successfully', lessonProgress });
});

export const getUserProgress = catchAsync(async (req: AuthRequest, res: Response) => {
  const progresses = await Progress.find({ user: req.userId })
    .populate('course', 'title thumbnail')
    .populate('career', 'title');

  res.json(progresses);
});

export const completeModule = catchAsync(async (req: AuthRequest, res: Response) => {
  const { courseId, moduleId } = req.params;

  let progress = await Progress.findOne({ user: req.userId, course: courseId });
  if (!progress) {
    progress = new Progress({ user: req.userId, course: courseId });
  }

  if (!progress.completedModules.includes(moduleId as any)) {
    progress.completedModules.push(moduleId as any);
  }

  progress.progressPercentage = Math.min(100, (progress.completedModules.length / 10) * 100);
  await progress.save();

  res.json({ message: 'Module completed', progress });
});
