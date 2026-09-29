import { Response, NextFunction } from 'express';
import path from 'path';
import { ChatMessage, User } from '../models';
import { AuthRequest } from '../middleware/auth';
import { getPagination, buildPaginatedResponse } from '../utils/pagination';
import { CHAT_MEDIA_DIRECTORY, removeChatMediaFile } from '../utils/chatMediaStorage';

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

export const createChatMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const file = req.file;
  const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';

  if (content.length > 2000 || (!content && !file)) {
    if (file) await removeChatMediaFile(file.filename);
    res.status(400).json({ success: false, message: 'Add a message or attach a file. Text must be 2,000 characters or fewer.' });
    return;
  }

  try {
    const user = await User.findById(req.user!.userId).select('firstName lastName anonymousNickname');
    if (!user) {
      if (file) await removeChatMediaFile(file.filename);
      res.status(401).json({ success: false, message: 'User not found.' });
      return;
    }

    const isAnonymous = req.body.isAnonymous !== 'false';
    const message = await ChatMessage.create({
      roomId: req.params.roomId,
      senderId: req.user!.userId,
      senderNickname: isAnonymous
        ? user.anonymousNickname || user.firstName
        : `${user.firstName} ${user.lastName}`,
      content,
      isAnonymous,
      ...(file && {
        media: {
          fileId: file.filename,
          mimeType: file.mimetype,
          originalName: file.originalname.slice(0, 255),
          size: file.size,
        },
      }),
    });

    const data = {
      id: message._id.toString(),
      roomId: message.roomId,
      senderId: message.senderId.toString(),
      senderNickname: message.senderNickname,
      content: message.content,
      media: message.media,
      isAnonymous: message.isAnonymous,
      createdAt: message.createdAt,
    };

    req.app.get('io')?.to(message.roomId).emit('chat:message', data);
    res.status(201).json({ success: true, data });
  } catch (error) {
    if (file) await removeChatMediaFile(file.filename);
    next(error);
  }
};

export const getChatMedia = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { fileId } = req.params;
    if (!/^[\da-f-]{36}$/i.test(fileId)) {
      res.status(404).json({ success: false, message: 'Media not found.' });
      return;
    }

    const message = await ChatMessage.findOne({
      'media.fileId': fileId,
      isModerated: false,
    }).select('media');
    if (!message?.media) {
      res.status(404).json({ success: false, message: 'Media not found.' });
      return;
    }

    res.type(message.media.mimeType);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.sendFile(path.join(CHAT_MEDIA_DIRECTORY, fileId), (error) => {
      if (error) next(error);
    });
  } catch (error) {
    next(error);
  }
};
