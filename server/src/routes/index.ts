import { Router } from 'express';
import authRoutes from './authRoutes';
import assessmentRoutes from './assessmentRoutes';
import moodRoutes from './moodRoutes';
import appointmentRoutes from './appointmentRoutes';
import forumRoutes from './forumRoutes';
import resourceRoutes from './resourceRoutes';
import notificationRoutes from './notificationRoutes';
import alertRoutes from './alertRoutes';
import adminRoutes from './adminRoutes';
import chatRoutes from './chatRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/moods', moodRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/forums', forumRoutes);
router.use('/resources', resourceRoutes);
router.use('/notifications', notificationRoutes);
router.use('/alerts', alertRoutes);
router.use('/admin', adminRoutes);
router.use('/chat', chatRoutes);

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'MHCS API is running', timestamp: new Date().toISOString() });
});

export default router;
