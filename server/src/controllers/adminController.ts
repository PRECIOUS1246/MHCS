import { Response, NextFunction } from 'express';
import {
  User,
  Assessment,
  MoodRecord,
  Appointment,
  ActivityLog,
  Alert,
  Resource,
} from '../models';
import { AuthRequest } from '../middleware/auth';
import { AppError, NotFoundError } from '../utils/errors';
import { getPagination, buildPaginatedResponse } from '../utils/pagination';
import { logActivity } from '../services/activityLogService';

export const getDashboardStats = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalCounsellors,
      totalAssessments,
      criticalAlerts,
      pendingAppointments,
      totalResources,
      recentActivity,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'counsellor' }),
      Assessment.countDocuments(),
      Alert.countDocuments({ isResolved: false, riskLevel: { $in: ['high', 'critical'] } }),
      Appointment.countDocuments({ status: 'pending' }),
      Resource.countDocuments({ isPublished: true }),
      ActivityLog.find().sort({ createdAt: -1 }).limit(10),
    ]);

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, students: totalStudents, counsellors: totalCounsellors },
        assessments: totalAssessments,
        criticalAlerts,
        pendingAppointments,
        resources: totalResources,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter: Record<string, unknown> = {};

    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { email: { $regex: req.query.search, $options: 'i' } },
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).select('-password').skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    res.json({ success: true, ...buildPaginatedResponse(users, total, page, limit) });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { isActive, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive, role },
      { new: true }
    ).select('-password');

    if (!user) throw new NotFoundError('User not found');

    await logActivity('user_updated', 'User', {
      userId: req.user!.userId,
      entityId: user._id.toString(),
      details: { isActive, role },
    });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const getActivityLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const [logs, total] = await Promise.all([
      ActivityLog.find()
        .populate('userId', 'email firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ActivityLog.countDocuments(),
    ]);

    res.json({ success: true, ...buildPaginatedResponse(logs, total, page, limit) });
  } catch (error) {
    next(error);
  }
};

export const getCounsellorDashboard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const counsellorId = req.user!.userId;

    const [highRiskAlerts, pendingAppointments, recentAssessments, moodTrends] =
      await Promise.all([
        Alert.find({ isResolved: false, riskLevel: { $in: ['high', 'critical'] } })
          .sort({ createdAt: -1 })
          .limit(10),
        Appointment.find({ counsellorId, status: 'pending' })
          .populate('studentId', 'firstName lastName email')
          .limit(10),
        Assessment.find({ riskLevel: { $in: ['high', 'critical'] }, isAnonymous: false })
          .populate('userId', 'firstName lastName email')
          .sort({ createdAt: -1 })
          .limit(10),
        MoodRecord.aggregate([
          { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              avgMood: { $avg: '$mood' },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

    res.json({
      success: true,
      data: {
        highRiskAlerts,
        pendingAppointments,
        recentAssessments,
        moodTrends,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentDashboard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;

    const [recentMoods, recentAssessments, upcomingAppointments, unreadNotifications] =
      await Promise.all([
        MoodRecord.find({ userId }).sort({ createdAt: -1 }).limit(7),
        Assessment.find({ userId }).sort({ createdAt: -1 }).limit(3),
        Appointment.find({
          studentId: userId,
          scheduledAt: { $gte: new Date() },
          status: { $in: ['pending', 'approved'] },
        })
          .populate('counsellorId', 'firstName lastName')
          .limit(5),
        import('../models').then((m) =>
          m.Notification.countDocuments({ userId, isRead: false })
        ),
      ]);

    const moodAverage =
      recentMoods.length > 0
        ? recentMoods.reduce((s, m) => s + m.mood, 0) / recentMoods.length
        : 0;

    res.json({
      success: true,
      data: {
        recentMoods,
        moodAverage: Math.round(moodAverage * 10) / 10,
        recentAssessments,
        upcomingAppointments,
        unreadNotifications,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.params.id === req.user!.userId) {
      throw new AppError('Cannot delete your own account', 400);
    }
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'User deactivated' });
  } catch (error) {
    next(error);
  }
};
