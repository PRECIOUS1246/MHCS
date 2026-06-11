import { Response, NextFunction } from 'express';
import { Alert } from '../models';
import { AuthRequest } from '../middleware/auth';
import { NotFoundError } from '../utils/errors';
import { getPagination, buildPaginatedResponse } from '../utils/pagination';

export const getAlerts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter: Record<string, unknown> = {};

    if (req.query.resolved !== undefined) {
      filter.isResolved = req.query.resolved === 'true';
    }
    if (req.query.risk) {
      filter.riskLevel = req.query.risk;
    }

    const [alerts, total] = await Promise.all([
      Alert.find(filter)
        .populate('userId', 'firstName lastName email studentId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Alert.countDocuments(filter),
    ]);

    res.json({ success: true, ...buildPaginatedResponse(alerts, total, page, limit) });
  } catch (error) {
    next(error);
  }
};

export const resolveAlert = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        isResolved: true,
        resolvedBy: req.user!.userId,
        resolvedAt: new Date(),
      },
      { new: true }
    );
    if (!alert) throw new NotFoundError('Alert not found');
    res.json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};
