import { Router } from 'express';
import {
  getCourseProgress,
  updateLessonProgress,
  getUserProgress,
  completeModule,
} from '../controllers/progress.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/user', authenticate, getUserProgress);
router.get('/course/:courseId', authenticate, getCourseProgress);
router.post('/lesson/:courseId/:lessonId', authenticate, updateLessonProgress);
router.post('/module/:courseId/:moduleId', authenticate, completeModule);

export default router;
