import type { ParamsDictionary } from 'express-serve-static-core';

export interface IdParam extends ParamsDictionary {
  id: string;
}
