import type { Response } from 'express';

export const sendError = (response: Response, statusCode: number, message: string) => {
  response.status(statusCode).json({
    status: 'error',
    message: message,
  });
};
