import multer from 'multer';
import path from 'path';
import fs from 'fs';

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

export const uploadPostImage = multer({
  storage: createStorage('posts'),
});

export const uploadProfileImage = multer({
  storage: createStorage('profiles'),
});
