import jwt from 'jsonwebtoken';
import { type Request } from 'express';

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
  const { user } = req;

  if (!user || typeof user === 'string') {
    throw new Error('Unauthorized, no active user found');
  }

  return user._id;
};
