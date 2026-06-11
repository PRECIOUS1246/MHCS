import { Response, NextFunction } from 'express';
import { ChatMessage } from '../models';
import { AuthRequest } from '../middleware/auth';
import { getPagination, buildPaginatedResponse } from '../utils/pagination';

export const getChatHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const roomId = req.params.roomId || 'peer-support-general';

    const [messages, total] = await Promise.all([
      ChatMessage.find({ roomId, isModerated: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ChatMessage.countDocuments({ roomId }),
    ]);

    res.json({
      success: true,
      ...buildPaginatedResponse(messages.reverse(), total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};
