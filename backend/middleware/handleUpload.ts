import { Request, Response, NextFunction } from 'express';
import { uploadPostImage, uploadProfileImage } from '../utils/storage';

export const postImageMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const upload = uploadPostImage.single('photo');

  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: `Upload post image error: ${err.message}` });
    }

    next();
  });
};

export const profileImageMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const upload = uploadProfileImage.single('photo');

  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: `Upload profile image error: ${err.message}` });
    }

    next();
  });
};
