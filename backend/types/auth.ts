import type { AuthTokensDto } from '../dtos/auth.dto';
import type { JwtPayload } from 'jsonwebtoken';

export interface TokenPayload extends JwtPayload {
  _id: string;
}

export type AuthTokensDtoWithId = AuthTokensDto & { _id: string };

// Augment the core Express module directly to avoid the namespace ESLint error
declare module 'express-serve-static-core' {
  interface Request {
    user?: TokenPayload | string;
  }
}
