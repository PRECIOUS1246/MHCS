import { Response, NextFunction } from 'express';
import { Assessment } from '../models';
import { AuthRequest } from '../middleware/auth';
import { scoreAssessment } from '../utils/assessmentScoring';
import { createAlert } from '../services/alertService';
import { getPagination, buildPaginatedResponse } from '../utils/pagination';
import { fetchAIAnalytics } from '../services/aiService';
import { logActivity } from '../services/activityLogService';

export const createAssessment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type, answers, isAnonymous } = req.body;
    const { score, riskLevel, recommendations } = scoreAssessment(type, answers);

    const assessment = await Assessment.create({
      userId: isAnonymous ? undefined : req.user?.userId,
      type,
      answers,
      score,
      riskLevel,
      recommendations,
      isAnonymous: !!isAnonymous,
    });

    if (!isAnonymous && req.user) {
      await logActivity('assessment_completed', 'Assessment', {
        userId: req.user.userId,
        entityId: assessment._id.toString(),
        details: { type, riskLevel, score },
      });
    }

    if (riskLevel === 'high' || riskLevel === 'critical') {
      await createAlert(
        'assessment',
        riskLevel,
        `${type.toUpperCase()} assessment score ${score} (${riskLevel} risk)`,
        {
          userId: isAnonymous ? undefined : req.user?.userId,
          assessmentId: assessment._id.toString(),
        }
      );
    }

    if (!isAnonymous && req.user) {
      await fetchAIAnalytics('/api/v1/risk-prediction', {
        userId: req.user.userId,
        assessmentScores: [score],
      });
    }

    res.status(201).json({
      success: true,
      data: {
        id: assessment._id,
        type,
        score,
        riskLevel,
        recommendations,
        createdAt: assessment.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAssessmentHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { userId: req.user!.userId };

    const [assessments, total] = await Promise.all([
      Assessment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Assessment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      ...buildPaginatedResponse(assessments, total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getCounsellorAssessments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const riskFilter = req.query.risk as string | undefined;

    const filter: Record<string, unknown> = { isAnonymous: false };
    if (riskFilter) filter.riskLevel = riskFilter;

    const [assessments, total] = await Promise.all([
      Assessment.find(filter)
        .populate('userId', 'firstName lastName email studentId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Assessment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      ...buildPaginatedResponse(assessments, total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};
