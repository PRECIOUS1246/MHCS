import { Response, NextFunction } from 'express';
import { Resource } from '../models';
import { AuthRequest } from '../middleware/auth';
import { NotFoundError } from '../utils/errors';
import { getPagination, buildPaginatedResponse } from '../utils/pagination';

export const getResources = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, type } = req.query;

    const filter: Record<string, unknown> = { isPublished: true };
    if (type) filter.type = type;
    if (search) {
      filter.$text = { $search: search as string };
    }

    const [resources, total] = await Promise.all([
      Resource.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Resource.countDocuments(filter),
    ]);

    res.json({ success: true, ...buildPaginatedResponse(resources, total, page, limit) });
  } catch (error) {
    next(error);
  }
};

export const createResource = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const resource = await Resource.create({
      ...req.body,
      createdBy: req.user!.userId,
    });
    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    next(error);
  }
};

export const updateResource = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!resource) throw new NotFoundError('Resource not found');
    res.json({ success: true, data: resource });
  } catch (error) {
    next(error);
  }
};

export const deleteResource = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) throw new NotFoundError('Resource not found');
    res.json({ success: true, message: 'Resource deleted' });
  } catch (error) {
    next(error);
  }
};
