import { Router } from 'express';
import * as alertController from '../controllers/alertController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { paginationSchema } from '../validators/schemas';

const router = Router();

router.get('/', authenticate, authorize('counsellor', 'admin'), validate(paginationSchema), alertController.getAlerts);
router.patch('/:id/resolve', authenticate, authorize('counsellor', 'admin'), alertController.resolveAlert);

export default router;
