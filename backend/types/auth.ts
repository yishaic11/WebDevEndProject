import type jwt from 'jsonwebtoken';

export interface TokenPayload extends jwt.JwtPayload {
  _id: string;
}
