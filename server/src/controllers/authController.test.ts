import { login, register } from './authController';
import { User } from '../models';
import bcrypt from 'bcryptjs';

jest.mock('../models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('bcryptjs', () => ({
  __esModule: true,
  default: {
    compare: jest.fn(),
    hash: jest.fn(),
  },
}));

jest.mock('../services/activityLogService', () => ({
  logActivity: jest.fn(),
}));

jest.mock('../utils/jwt', () => ({
  generateAccessToken: jest.fn(() => 'access-token'),
  generateRefreshToken: jest.fn(() => 'refresh-token'),
  verifyRefreshToken: jest.fn(),
}));

jest.mock('../config', () => ({
  config: {
    cookieSecure: false,
  },
}));

describe('authController login', () => {
  const mockedUser = User as unknown as { findOne: jest.Mock; create: jest.Mock };
  const mockedBcrypt = bcrypt as unknown as { compare: jest.Mock; hash: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs in successfully after password verification without OTP', async () => {
    const user = {
      _id: { toString: () => 'user-1' },
      email: 'real.user@example.com',
      password: 'hashed-password',
      isActive: true,
      role: 'student',
      firstName: 'Real',
      lastName: 'User',
      anonymousNickname: 'real-user',
      save: jest.fn().mockResolvedValue(true),
      refreshToken: undefined,
    };

    mockedUser.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(user),
    });
    mockedBcrypt.compare.mockResolvedValue(true);

    const req = { body: { email: 'real.user@example.com', password: 'Password123!' }, ip: '127.0.0.1' };
    const res = {
      json: jest.fn(),
      cookie: jest.fn(),
    };
    const next = jest.fn();

    await login(req as any, res as any, next as any);

    expect(mockedBcrypt.compare).toHaveBeenCalledWith('Password123!', 'hashed-password');
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: expect.objectContaining({ user: expect.objectContaining({ role: 'student' }) }) })
    );
    expect(next).not.toHaveBeenCalled();
  });
});

describe('authController register', () => {
  const mockedUser = User as unknown as { findOne: jest.Mock; create: jest.Mock };
  const mockedBcrypt = bcrypt as unknown as { compare: jest.Mock; hash: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a student account with a fixed role and student-specific fields', async () => {
    mockedUser.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    mockedBcrypt.hash.mockResolvedValue('hashed-password');
    mockedUser.create.mockResolvedValue({
      _id: { toString: () => 'user-1' },
      email: 'student@example.com',
      role: 'student',
      firstName: 'Student',
      lastName: 'One',
      save: jest.fn().mockResolvedValue(true),
      refreshToken: undefined,
    });

    const req = {
      body: {
        fullName: 'Student One',
        email: 'student@example.com',
        studentId: 'STU100',
        department: 'Computer Science',
        level: '300',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      },
      ip: '127.0.0.1',
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), cookie: jest.fn() };
    const next = jest.fn();

    await register(req as any, res as any, next as any);

    expect(mockedUser.create).toHaveBeenCalledWith(expect.objectContaining({
      role: 'student',
      studentId: 'STU100',
      department: 'Computer Science',
      level: '300',
    }));
    expect(next).not.toHaveBeenCalled();
  });
});
