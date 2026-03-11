import express, { type Express } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import passport from 'passport';
import { initPassport } from './config/passport';
import postsRouter from './routes/posts';
import aiRouter from './routes/ai';
import commentsRouter from './routes/comments';
import { specs, swaggerUi } from './swagger';

dotenv.config({ path: '../.env' });
const app: Express = express();

const initApp = () => {
  const promise = new Promise<Express>((resolve, reject) => {
    app.use(bodyParser.json());
    app.use(function (_req, res, next) {
      res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL ?? '*');
      res.header('Access-Control-Allow-Headers', '*');
      res.header('Access-Control-Allow-Methods', '*');
      next();
    });

    initPassport();
    app.use(passport.initialize());

    app.use('/api/coverage', express.static(path.join(process.cwd(), 'coverage/lcov-report')));

    app.use('/public', express.static(path.join(process.cwd(), 'public')));

    app.use('/api/ai', aiRouter);
    app.use('/api/auth', authRouter);
    app.use('/api/users', usersRouter);
    app.use('/api/posts', postsRouter);
    app.use('/api/comments', commentsRouter);

    // Swagger Documentation
    app.use(
      '/api/docs',
      swaggerUi.serve,
      swaggerUi.setup(specs, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'API Documentation - Connect Web App',
      }),
    );
    app.get('/api/docs.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(specs);
    });

    const isProd = process.env.NODE_ENV === 'prod';

    if (isProd) {
      const reactBuildPath = path.join(process.cwd(), 'public/client-dist');
      app.use(express.static(reactBuildPath));

      app.get(/^(?!\/api).*$/, (_req, res) => {
        res.sendFile(path.join(reactBuildPath, 'index.html'));
      });

      console.log('Serving React production build from /client-dist');
    }

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
