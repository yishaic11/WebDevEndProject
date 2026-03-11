import request from 'supertest';
import { type Express } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import initApp from '../index';
import User from '../models/user';
import type { UserResponseDto } from '../dtos/user.dto';
import type { AuthTokensDtoWithId } from '../types/auth';

interface ErrorResponse {
  message: string;
}

let app: Express;

beforeAll(async () => {
  app = await initApp();
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Auth Controller', () => {
  const testUser = {
    username: 'authtester',
    email: 'auth@test.com',
    password: 'password123',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user with a profile photo URL', async () => {
      const pngBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI6QAAAABJRU5ErkJggg==',
        'base64',
      );

      const response = await request(app)
        .post('/api/auth/register')
        .field('username', testUser.username)
        .field('email', testUser.email)
        .field('password', testUser.password)
        .attach('photo', pngBuffer, 'profile.png')
        .expect(201);

      const user = response.body as UserResponseDto;

      expect(user.username).toEqual(testUser.username);
      expect(user).not.toHaveProperty('password');
      expect(user).toHaveProperty('photoUrl');
      expect(typeof user.photoUrl).toEqual('string');
      expect(user.photoUrl).toMatch(/\/public\/uploads\/profiles\//);
    });

    it('should fail if username already exists', async () => {
      await User.create({ ...testUser, password: 'hashed_password' });
      const response = await request(app).post('/api/auth/register').send(testUser).expect(400);
      const error = response.body as ErrorResponse;

      expect(error.message).toEqual('Username or email already exists.');
    });

    it('should return 400 if fields are missing', async () => {
      const response = await request(app).post('/api/auth/register').send({ username: 'no_email' }).expect(400);

      const error = response.body as ErrorResponse;
      expect(error.message).toEqual('Username, email, and password are required.');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(testUser);
    });

    it('should login successfully and return tokens', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('_id');
    });

    it('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: testUser.username, password: 'wrong_password' })
        .expect(400);

      const error = response.body as ErrorResponse;
      expect(error.message).toEqual('Invalid username or password.');
    });

    it('should return 400 when username field is missing', async () => {
      const response = await request(app).post('/api/auth/login').send({ password: testUser.password }).expect(400);

      const error = response.body as ErrorResponse;
      expect(error.message).toEqual('Username and password are required.');
    });

    it('should return 400 when password field is missing', async () => {
      const response = await request(app).post('/api/auth/login').send({ username: testUser.username }).expect(400);

      const error = response.body as ErrorResponse;
      expect(error.message).toEqual('Username and password are required.');
    });

    it('should return 400 when user does not exist', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nonexistent_user', password: 'password123' })
        .expect(400);

      const error = response.body as ErrorResponse;
      expect(error.message).toEqual('Invalid username or password.');
    });

    it('should return 400 for a social account (no password)', async () => {
      await User.create({
        username: 'socialuser',
        email: 'social@test.com',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'socialuser', password: 'anypassword' })
        .expect(400);

      const error = response.body as ErrorResponse;
      expect(error.message).toEqual('This account uses social login. Please sign in with Google.');
    });
  });

  describe('POST /api/auth/refreshToken', () => {
    let refreshToken: string;

    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(testUser);
      const log = await request(app).post('/api/auth/login').send({
        username: testUser.username,
        password: testUser.password,
      });
      const loginData = log.body as AuthTokensDtoWithId;
      refreshToken = loginData.refreshToken;
    });

    it('should generate new tokens using a valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refreshToken')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should clear all tokens if a valid JWT is used but not found in DB (Reuse Detection)', async () => {
      const regData = {
        username: 'reuse',
        email: 'reuse@test.com',
        password: 'password123',
      };
      await request(app).post('/api/auth/register').send(regData);

      const loginRes = await request(app).post('/api/auth/login').send({
        username: regData.username,
        password: regData.password,
      });
      const loginData = loginRes.body as AuthTokensDtoWithId;

      const userId = loginData._id;
      const validButUnrecognizedToken = jwt.sign(
        { _id: userId, random: Math.random() },
        process.env.REFRESH_TOKEN_SECRET as string,
      );

      const response = await request(app)
        .post('/api/auth/refreshToken')
        .set('Authorization', `Bearer ${validButUnrecognizedToken}`);

      expect(response.status).toEqual(403);

      const user = await User.findById(userId);
      expect(user?.refreshTokens.length).toEqual(0);
    });

    it('should return 403 for an invalid token signature', async () => {
      await request(app).post('/api/auth/refreshToken').set('Authorization', 'Bearer invalid_token_here').expect(403);
    });

    it('should return 401 when no Authorization header is provided', async () => {
      await request(app).post('/api/auth/refreshToken').expect(401);
    });

    it('should return 403 when the token belongs to a deleted user', async () => {
      const tokenForDeletedUser = jwt.sign(
        { _id: new mongoose.Types.ObjectId().toString() },
        process.env.REFRESH_TOKEN_SECRET as string,
      );

      await request(app).post('/api/auth/refreshToken').set('Authorization', `Bearer ${tokenForDeletedUser}`).expect(403);
    });
  });

  describe('POST /api/auth/logout', () => {
    it("should remove the specific token from the user's list", async () => {
      await request(app).post('/api/auth/register').send(testUser);
      const log = await request(app).post('/api/auth/login').send({
        username: testUser.username,
        password: testUser.password,
      });
      const loginData = log.body as AuthTokensDtoWithId;
      const token = loginData.refreshToken;

      await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${token}`).expect(200);

      const user = await User.findById(loginData._id);
      expect(user?.refreshTokens).not.toContain(token);
    });

    it('should return 401 if no token provided during logout', async () => {
      await request(app).post('/api/auth/logout').expect(401);
    });

    it('should return 403 when logout token belongs to a deleted user', async () => {
      const tokenForDeletedUser = jwt.sign(
        { _id: new mongoose.Types.ObjectId().toString() },
        process.env.REFRESH_TOKEN_SECRET as string,
      );

      await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${tokenForDeletedUser}`).expect(403);
    });

    it('should clear tokens and return 403 if refresh token is not in DB (reuse on logout)', async () => {
      await request(app).post('/api/auth/register').send(testUser);
      const log = await request(app).post('/api/auth/login').send({
        username: testUser.username,
        password: testUser.password,
      });
      const loginData = log.body as AuthTokensDtoWithId;

      const unusedToken = jwt.sign(
        { _id: loginData._id, nonce: Math.random() },
        process.env.REFRESH_TOKEN_SECRET as string,
      );

      const res = await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${unusedToken}`).expect(403);

      expect((res.body as ErrorResponse).message).toBeTruthy();

      const user = await User.findById(loginData._id);
      expect(user?.refreshTokens.length).toEqual(0);
    });
  });

  describe('GET /api/auth/me', () => {
    let accessToken: string;
    let userId: string;

    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(testUser);
      const log = await request(app).post('/api/auth/login').send({
        username: testUser.username,
        password: testUser.password,
      });
      const loginData = log.body as AuthTokensDtoWithId;
      accessToken = loginData.accessToken;
      userId = loginData._id;
    });

    it('should return the current user profile with a valid access token', async () => {
      const response = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${accessToken}`).expect(200);

      const user = response.body as { _id: string; username: string; email: string };
      expect(user).toHaveProperty('_id');
      expect(user.username).toEqual(testUser.username);
      expect(user.email).toEqual(testUser.email);
    });

    it('should return 401 if no Authorization header is provided', async () => {
      await request(app).get('/api/auth/me').expect(401);
    });

    it('should return 403 if an invalid/expired token is provided', async () => {
      await request(app).get('/api/auth/me').set('Authorization', 'Bearer totally.invalid.token').expect(403);
    });

    it('should return 404 when user is deleted after token was issued', async () => {
      await User.findByIdAndDelete(userId);

      const response = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${accessToken}`).expect(404);

      expect((response.body as ErrorResponse).message).toBeTruthy();
    });
  });
});
