import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { User } from '../models';
import { JwtPayload, UserRole } from '../types';

export interface AuthRequest extends Request {
  user?: JwtPayload & { id: string };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies?.accessToken;

    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select('isActive role');

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Account inactive or not found');
    }

    req.user = { ...decoded, id: decoded.userId };
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }
    next();
  };
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies?.accessToken;

    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = { ...decoded, id: decoded.userId };
    }
  } catch {
    // Optional auth - continue without user
  }
  next();
};
