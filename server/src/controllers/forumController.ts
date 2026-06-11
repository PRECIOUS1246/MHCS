import { Response, NextFunction } from 'express';
import { Forum, ForumPost } from '../models';
import { AuthRequest } from '../middleware/auth';
import { NotFoundError } from '../utils/errors';
import { getPagination, buildPaginatedResponse } from '../utils/pagination';

export const getForums = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const forums = await Forum.find({ isActive: true }).sort({ title: 1 });
    res.json({ success: true, data: forums });
  } catch (error) {
    next(error);
  }
};

export const createForum = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, category } = req.body;
    const forum = await Forum.create({
      title,
      description,
      category,
      createdBy: req.user!.userId,
    });
    res.status(201).json({ success: true, data: forum });
  } catch (error) {
    next(error);
  }
};

export const getForumPosts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { forumId: req.params.forumId, isHidden: false, parentId: { $exists: false } };

    const [posts, total] = await Promise.all([
      ForumPost.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ForumPost.countDocuments(filter),
    ]);

    res.json({ success: true, ...buildPaginatedResponse(posts, total, page, limit) });
  } catch (error) {
    next(error);
  }
};

export const createForumPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { forumId, title, content, isAnonymous, parentId } = req.body;

    const forum = await Forum.findById(forumId);
    if (!forum) throw new NotFoundError('Forum not found');

    const user = await import('../models').then((m) => m.User.findById(req.user!.userId));
    const anonymousName = isAnonymous !== false ? user?.anonymousNickname || 'Anonymous' : `${user?.firstName}`;

    const post = await ForumPost.create({
      forumId,
      authorId: isAnonymous === false ? req.user!.userId : undefined,
      anonymousName,
      title,
      content,
      isAnonymous: isAnonymous !== false,
      parentId,
    });

    await Forum.findByIdAndUpdate(forumId, { $inc: { postCount: 1 } });

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

export const likePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!post) throw new NotFoundError('Post not found');
    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

export const reportPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { reports: 1 } },
      { new: true }
    );
    if (!post) throw new NotFoundError('Post not found');
    res.json({ success: true, message: 'Post reported for moderation' });
  } catch (error) {
    next(error);
  }
};

export const moderatePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { isHidden } = req.body;
    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      { isHidden, isModerated: true },
      { new: true }
    );
    if (!post) throw new NotFoundError('Post not found');
    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};
