import { Router } from 'express';
import * as notificationController from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { paginationSchema } from '../validators/schemas';

const router = Router();

router.get('/', authenticate, validate(paginationSchema), notificationController.getNotifications);
router.patch('/:id/read', authenticate, notificationController.markAsRead);
router.patch('/read-all', authenticate, notificationController.markAllAsRead);

export default router;
