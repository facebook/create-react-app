import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  enrollInCourse,
  getEnrollments,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/enroll', authenticate, enrollInCourse);
router.get('/enrollments', authenticate, getEnrollments);

export default router;
