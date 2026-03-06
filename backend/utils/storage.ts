import multer, { type StorageEngine, type FileFilterCallback } from 'multer';
import { type Request } from 'express';
import fs from 'fs';
import path from 'path';

type Callback = (error: Error | null, destination: string) => void;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB limit
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const createStorage = (subfolder: string): StorageEngine =>
  multer.diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, callback: Callback) => {
      const dir = path.join('public', 'uploads', subfolder);

      fs.mkdir(dir, { recursive: true }, (err) => {
        callback(err, dir);
      });
    },
    filename: (_req: Request, file: Express.Multer.File, callback: Callback) => {
      const ext = path.extname(file.originalname);
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

      callback(null, uniqueName);
    },
  });

const imageFilter = (_req: Request, file: Express.Multer.File, callback: FileFilterCallback): void => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    callback(null, true);
  } else {
    const formattedTypes = ALLOWED_TYPES.map((type) => type.split('/')[1]).join(', ');
    callback(new Error(`Invalid image file type. Only ${formattedTypes} are allowed`));
  }
};

export const uploadPostImage = multer({
  storage: createStorage('posts'),
  fileFilter: imageFilter,
  limits: { fileSize: MAX_SIZE },
});

export const uploadProfileImage = multer({
  storage: createStorage('profiles'),
  fileFilter: imageFilter,
  limits: { fileSize: MAX_SIZE },
});
