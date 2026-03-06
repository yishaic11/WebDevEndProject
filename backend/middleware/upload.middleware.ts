import type { Request, Response, NextFunction } from 'express';
import { uploadPostImage, uploadProfileImage } from '../utils/storage';

export const postImageMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const upload = uploadPostImage.single('photo');

  upload(req, res, (err: unknown) => {
    if (err) {
      if (err instanceof Error) {
        return res.status(400).json({ error: `Upload post image error: ${err.message}` });
      }

      return res.status(400).json({ error: 'An unknown upload error occurred.' });
    }

    next();
  });
};

export const profileImageMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const upload = uploadProfileImage.single('photo');

  upload(req, res, (err: unknown) => {
    if (err) {
      if (err instanceof Error) {
        return res.status(400).json({ error: `Upload profile image error: ${err.message}` });
      }

      return res.status(400).json({ error: 'An unknown upload error occurred.' });
    }

    next();
  });
};
