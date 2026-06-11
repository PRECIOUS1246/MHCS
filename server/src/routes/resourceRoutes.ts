import { Router } from 'express';
import * as resourceController from '../controllers/resourceController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { resourceSchema, paginationSchema } from '../validators/schemas';

const router = Router();

router.get('/', authenticate, validate(paginationSchema), resourceController.getResources);
router.post('/', authenticate, authorize('admin'), validate(resourceSchema), resourceController.createResource);
router.patch('/:id', authenticate, authorize('admin'), resourceController.updateResource);
router.delete('/:id', authenticate, authorize('admin'), resourceController.deleteResource);

export default router;
