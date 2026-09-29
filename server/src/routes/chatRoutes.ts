import { Router } from 'express';
import * as chatController from '../controllers/chatController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { uploadChatMedia } from '../middleware/chatMediaUpload';
import { paginationSchema } from '../validators/schemas';

const router = Router();

router.get('/:roomId/history', authenticate, validate(paginationSchema), chatController.getChatHistory);
router.post('/:roomId/messages', authenticate, uploadChatMedia, chatController.createChatMessage);
router.get('/media/:fileId', authenticate, chatController.getChatMedia);

export default router;
