import multer from 'multer';
import path from 'path';
import fs from 'fs';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB limit
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const createStorage = (subfolder: string) =>
  multer.diskStorage({
    destination: (_req, _file, callback) => {
      const dir = path.join('public', 'uploads', subfolder);

      fs.mkdir(dir, { recursive: true }, (err) => {
        callback(err, dir);
      });
    },
    filename: (_req, file, callback) => {
      const ext = path.extname(file.originalname);
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      callback(null, uniqueName);
    },
  });

const imageFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image file type. Only JPEG, PNG, and WebP are allowed'), false);
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
