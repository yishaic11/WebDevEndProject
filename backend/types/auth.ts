import type { AuthTokensDto } from '../dtos/auth.dto';
import type { JwtPayload } from 'jsonwebtoken';
import type { Request } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

export interface TokenPayload extends JwtPayload {
  _id: string;
}

export type AuthTokensDtoWithId = AuthTokensDto & { _id: string };

export interface AuthenticatedRequest<P = ParamsDictionary, ResBody = unknown, ReqBody = unknown> extends Request<
  P,
  ResBody,
  ReqBody
> {
  user?: TokenPayload | string;
}
