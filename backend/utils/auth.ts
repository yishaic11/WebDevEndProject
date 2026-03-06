import jwt from 'jsonwebtoken';
import { type Request } from 'express';
import type { TokenPayload } from '../types/auth';

export const signAccessToken = (payload: object): string => {
  const expiresIn = process.env.ACCESS_TOKEN_EXPIRATION || '1d';
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

  if (!accessTokenSecret) {
    throw new Error('ACCESS_TOKEN_SECRET is not defined');
  }

  return jwt.sign(payload, accessTokenSecret, {
    expiresIn,
  } as jwt.SignOptions);
};

export const signRefreshToken = (payload: object): string => {
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

  if (!refreshTokenSecret) {
    throw new Error('REFRESH_TOKEN_SECRET is not defined');
  }

  return jwt.sign(payload, refreshTokenSecret);
};

export const getActiveUserId = (req: Request): string => {
  const authHeaders = req.headers['authorization'];
  const token = authHeaders && authHeaders.split(' ')[1];
  const secret = process.env.ACCESS_TOKEN_SECRET;

  if (!token) {
    throw new Error('Unauthorized: No active user found');
  }

  if (!secret) {
    throw new Error('Server configuration error: ACCESS_TOKEN_SECRET is not defined');
  }

  try {
    const userInfo = jwt.verify(token, secret) as TokenPayload;
    return userInfo._id;
  } catch (error) {
    throw new Error(`Error verifying token: ${error instanceof Error ? error.message : String(error)}`);
  }
};
