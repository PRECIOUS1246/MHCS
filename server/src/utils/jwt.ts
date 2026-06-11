import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JwtPayload } from '../types';

export const generateAccessToken = (payload: JwtPayload): string =>
  jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn } as jwt.SignOptions);

export const generateRefreshToken = (payload: JwtPayload): string =>
  jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);

export const verifyAccessToken = (token: string): JwtPayload =>
  jwt.verify(token, config.jwt.secret) as JwtPayload;

export const verifyRefreshToken = (token: string): JwtPayload =>
  jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
