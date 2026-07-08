import { Router } from 'express';
import {
  getAllCareers,
  getCareerById,
  createCareer,
  updateCareer,
  deleteCareer,
} from '../controllers/career.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getAllCareers);
router.get('/:id', getCareerById);
router.post('/', authenticate, authorize('admin', 'instructor'), createCareer);
router.put('/:id', authenticate, authorize('admin', 'instructor'), updateCareer);
router.delete('/:id', authenticate, authorize('admin'), deleteCareer);

export default router;
