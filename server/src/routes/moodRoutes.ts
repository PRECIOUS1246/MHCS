import { Router } from 'express';
import * as moodController from '../controllers/moodController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { moodSchema, paginationSchema } from '../validators/schemas';

const router = Router();

router.post('/', authenticate, authorize('student'), validate(moodSchema), moodController.createMood);
router.get('/history', authenticate, validate(paginationSchema), moodController.getMoodHistory);
router.get('/analytics', authenticate, moodController.getMoodAnalytics);

export default router;
