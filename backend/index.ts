import express, { type Express } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import postsRouter from './routes/posts';
import commentsRouter from './routes/comments';

dotenv.config({ path: '../.env' });
const app: Express = express();

const initApp = () => {
  const promise = new Promise<Express>((resolve, reject) => {
    app.use(bodyParser.json());
    app.use(function (req, res, next) {
      res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL ?? '*');
      res.header('Access-Control-Allow-Headers', '*');
      res.header('Access-Control-Allow-Methods', '*');
      next();
    });

    app.use('/coverage', express.static(path.join(process.cwd(), 'coverage/lcov-report')));

    app.use('/public', express.static(path.join(process.cwd(), 'public')));

    app.use('/auth', authRouter);
    app.use('/users', usersRouter);
    app.use('/posts', postsRouter);
    app.use('/comments', commentsRouter);

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('DATABASE_URL is not defined in the environment variables.');
      reject(new Error('DATABASE_URL is not defined'));
    } else {
      mongoose
        .connect(databaseUrl, {})
        .then(() => {
          resolve(app);
        })
        .catch((error: unknown) => {
          console.error('Error connecting to MongoDB', error);
          reject(error instanceof Error ? error : new Error(String(error)));
        });
    }
    const db = mongoose.connection;
    db.on('error', (error) => {
      console.error('Error connecting to MongoDB', error);
    });
    db.once('open', () => {
      console.log('Connected to MongoDB');
    });
  });
  return promise;
};

export default initApp;
