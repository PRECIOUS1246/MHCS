import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { paginationSchema } from '../validators/schemas';

const router = Router();

router.get('/dashboard', authenticate, authorize('admin'), adminController.getDashboardStats);
router.get('/users', authenticate, authorize('admin'), validate(paginationSchema), adminController.getUsers);
router.patch('/users/:id', authenticate, authorize('admin'), adminController.updateUser);
router.delete('/users/:id', authenticate, authorize('admin'), adminController.deleteUser);
router.get('/activity-logs', authenticate, authorize('admin'), validate(paginationSchema), adminController.getActivityLogs);
router.get('/counsellor-dashboard', authenticate, authorize('counsellor'), adminController.getCounsellorDashboard);
router.get('/student-dashboard', authenticate, authorize('student'), adminController.getStudentDashboard);

export default router;
