import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models';
import { AuthRequest } from '../middleware/auth';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError, UnauthorizedError } from '../utils/errors';
import { logActivity } from '../services/activityLogService';
import { sendOtpEmail } from '../services/emailService';
import { config } from '../config';

const cookieOptions = {
  httpOnly: true,
  secure: config.cookieSecure,
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const otpLifetimeMs = 10 * 60 * 1000;
const generateOtpCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export const register = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { fullName, email, password, confirmPassword, studentId, department, level } = req.body;

    if (!fullName || !email || !studentId || !department || !level || !password || !confirmPassword) {
      throw new AppError('All fields are required', 400);
    }

    if (password !== confirmPassword) {
      throw new AppError('Passwords do not match', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedStudentId = studentId.toString().trim().toUpperCase();

    const [existingEmail, existingStudentId] = await Promise.all([
      User.findOne({ email: normalizedEmail }),
      User.findOne({ studentId: normalizedStudentId }),
    ]);

    if (existingEmail) throw new AppError('Email already registered', 409);
    if (existingStudentId) throw new AppError('Student ID already registered', 409);

    const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
    const firstName = nameParts.shift() || fullName.trim();
    const lastName = nameParts.join(' ');

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'student',
      studentId: normalizedStudentId,
      department: department.trim(),
      level: level.trim(),
      anonymousNickname: `Anonymous${Math.floor(Math.random() * 9000) + 1000}`,
    });

    const payload = { userId: user._id.toString(), email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.refreshToken = refreshToken;
    await user.save();

    await logActivity('register', 'User', {
      userId: user._id.toString(),
      ipAddress: req.ip,
    });

    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password, otp } = req.body;

    const user = await User.findOne({ email }).select('+password +refreshToken +otpHash +otpExpiresAt');
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (otp) {
      if (!user.otpHash || !user.otpExpiresAt || new Date(user.otpExpiresAt) < new Date()) {
        throw new AppError('OTP expired or not requested', 400);
      }

      const isValidOtp = await bcrypt.compare(otp, user.otpHash);
      if (!isValidOtp) {
        throw new UnauthorizedError('Invalid OTP');
      }

      user.otpHash = undefined;
      user.otpExpiresAt = undefined;
    } else {
      if (!password) {
        throw new AppError('Password required', 400);
      }

      if (!(await bcrypt.compare(password, user.password))) {
        throw new UnauthorizedError('Invalid email or password');
      }

      if (!user.isActive) throw new UnauthorizedError('Account is deactivated');

      const otpCode = generateOtpCode();
      user.otpHash = await bcrypt.hash(otpCode, 8);
      user.otpExpiresAt = new Date(Date.now() + otpLifetimeMs);
      await user.save();

      const previewUrl = await sendOtpEmail(user.email, otpCode);

      const response: any = {
        success: true,
        requiresOtp: true,
        message: 'A one-time verification code has been sent to your email address.',
      };
      if (previewUrl && process.env.NODE_ENV !== 'production') {
        response.previewUrl = previewUrl;
      }

      res.json(response);
      return;
    }

    const payload = { userId: user._id.toString(), email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    await logActivity('login', 'User', { userId: user._id.toString(), ipAddress: req.ip });

    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          anonymousNickname: user.anonymousNickname,
        },
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;
    if (!token) throw new UnauthorizedError('Refresh token required');

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const payload = { userId: user._id.toString(), email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie('refreshToken', newRefreshToken, cookieOptions);
    res.json({ success: true, data: { accessToken } });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user.userId, { $unset: { refreshToken: 1 } });
      await logActivity('logout', 'User', { userId: req.user.userId, ipAddress: req.ip });
    }
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.passwordResetExpires = new Date(Date.now() + 3600000);
      await user.save();
      // In production: send email with reset link containing resetToken
    }

    res.json({
      success: true,
      message: 'If an account exists, a password reset link has been sent',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) throw new AppError('Invalid or expired reset token', 400);

    user.password = await bcrypt.hash(password, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) throw new AppError('User not found', 404);

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        anonymousNickname: user.anonymousNickname,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, anonymousNickname, department, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user!.userId,
      { firstName, lastName, anonymousNickname, department, avatar },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
