import type { Request, Response, NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { sendError } from '../utils';

interface AuthenticatedRequest extends Request {
  user?: JwtPayload | string;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
  const authHeaders = req.headers['authorization'];
  const token = authHeaders && authHeaders.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  if (!accessTokenSecret) {
    sendError(res, 500, 'ACCESS_TOKEN_SECRET is not defined');
    throw new Error('ACCESS_TOKEN_SECRET is not defined');
  }

  jwt.verify(token, accessTokenSecret, (error, user) => {
    if (error) {
      sendError(res, 403, error.message);
      throw error;
    }

    req.user = user;
    next();
  });
};
