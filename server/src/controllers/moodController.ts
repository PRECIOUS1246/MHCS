import { Response, NextFunction } from 'express';
import { MoodRecord } from '../models';
import { AuthRequest } from '../middleware/auth';
import { getPagination, buildPaginatedResponse } from '../utils/pagination';
import { fetchAIAnalytics } from '../services/aiService';
import { createAlert } from '../services/alertService';

export const createMood = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { mood, emoji, note, tags } = req.body;

    const record = await MoodRecord.create({
      userId: req.user!.userId,
      mood,
      emoji,
      note,
      tags,
    });

    if (mood <= 2) {
      await createAlert(
        'mood',
        mood === 1 ? 'critical' : 'high',
        `Low mood logged (${mood}/10)`,
        { userId: req.user!.userId }
      );
    }

    const recentMoods = await MoodRecord.find({ userId: req.user!.userId })
      .sort({ createdAt: -1 })
      .limit(14)
      .select('mood');

    await fetchAIAnalytics('/api/v1/sentiment', {
      userId: req.user!.userId,
      text: note,
      moodScores: recentMoods.map((m) => m.mood),
    });

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

export const getMoodHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { userId: req.user!.userId };

    const [records, total] = await Promise.all([
      MoodRecord.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      MoodRecord.countDocuments(filter),
    ]);

    res.json({
      success: true,
      ...buildPaginatedResponse(records, total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getMoodAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.query.userId as string | undefined;
    const targetId = userId && req.user!.role !== 'student' ? userId : req.user!.userId;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const records = await MoodRecord.find({
      userId: targetId,
      createdAt: { $gte: thirtyDaysAgo },
    }).sort({ createdAt: 1 });

    const weeklyAvg = records.reduce((acc, r) => {
      const week = Math.floor(
        (Date.now() - r.createdAt.getTime()) / (7 * 24 * 60 * 60 * 1000)
      );
      if (!acc[week]) acc[week] = { sum: 0, count: 0 };
      acc[week].sum += r.mood;
      acc[week].count += 1;
      return acc;
    }, {} as Record<number, { sum: number; count: number }>);

    const trend = Object.entries(weeklyAvg).map(([week, data]) => ({
      week: parseInt(week),
      average: Math.round((data.sum / data.count) * 10) / 10,
    }));

    const average =
      records.length > 0
        ? Math.round((records.reduce((s, r) => s + r.mood, 0) / records.length) * 10) / 10
        : 0;

    res.json({
      success: true,
      data: {
        records,
        average,
        trend,
        totalEntries: records.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
