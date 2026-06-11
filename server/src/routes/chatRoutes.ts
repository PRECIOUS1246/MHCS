import { Router } from 'express';
import * as chatController from '../controllers/chatController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { paginationSchema } from '../validators/schemas';

const router = Router();

router.get('/:roomId/history', authenticate, validate(paginationSchema), chatController.getChatHistory);

export default router;
