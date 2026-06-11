import { Router } from 'express';
import * as assessmentController from '../controllers/assessmentController';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { assessmentSchema, paginationSchema } from '../validators/schemas';

const router = Router();

router.post('/', optionalAuth, validate(assessmentSchema), assessmentController.createAssessment);
router.get('/history', authenticate, authorize('student'), validate(paginationSchema), assessmentController.getAssessmentHistory);
router.get('/counsellor', authenticate, authorize('counsellor', 'admin'), validate(paginationSchema), assessmentController.getCounsellorAssessments);

export default router;
