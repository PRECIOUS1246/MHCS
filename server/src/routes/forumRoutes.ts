import { Router } from 'express';
import * as forumController from '../controllers/forumController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { forumPostSchema, paginationSchema } from '../validators/schemas';

const router = Router();

router.get('/', authenticate, forumController.getForums);
router.post('/', authenticate, authorize('admin'), forumController.createForum);
router.get('/:forumId/posts', authenticate, validate(paginationSchema), forumController.getForumPosts);
router.post('/posts', authenticate, validate(forumPostSchema), forumController.createForumPost);
router.post('/posts/:id/like', authenticate, forumController.likePost);
router.post('/posts/:id/report', authenticate, forumController.reportPost);
router.patch('/posts/:id/moderate', authenticate, authorize('admin'), forumController.moderatePost);

export default router;
