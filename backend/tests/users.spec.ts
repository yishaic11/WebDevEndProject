import request from 'supertest';
import { type Express } from 'express';
import mongoose from 'mongoose';
import initApp from '../index';
import { registerTestUser, userData } from './testUtils';
import User from '../models/user';
import { type UserResponseDto } from '../dtos/user.dto';

let app: Express;

beforeAll(async () => {
  app = await initApp();
  await registerTestUser(app);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({ email: { $ne: userData.email } });
});

describe('Users Controller', () => {
  describe('GET /api/users', () => {
    it('should return all users, only the authenticated user initially', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toEqual(true);
      const users = response.body as UserResponseDto[];
      expect(users.length).toEqual(1);
    });

    it('should return all users including newly created ones', async () => {
      await User.create([
        {
          username: 'user1',
          email: 'user1@example.com',
          password: 'password123',
        },
        {
          username: 'user2',
          email: 'user2@example.com',
          password: 'password123',
        },
      ]);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .expect(200);

      const users = response.body as UserResponseDto[];
      expect(users.length).toEqual(3);
    });

    it('should return 401 if no token is provided', async () => {
      await request(app).get('/api/users').expect(401);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a single user when given a valid ID', async () => {
      const response = await request(app)
        .get(`/api/users/${userData._id}`)
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .expect(200);

      const user = response.body as UserResponseDto;
      expect(user._id).toEqual(userData._id);
    });

    it("should return 404 when user ID format is valid but user doesn't exist", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await request(app).get(`/api/users/${fakeId}`).set('Authorization', `Bearer ${userData.accessToken}`).expect(404);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update the username and photo', async () => {
      const newUsername = `newuser_${Date.now()}`;
      const pngBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI6QAAAABJRU5ErkJggg==',
        'base64',
      );

      const response = await request(app)
        .put(`/api/users/${userData._id}`)
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .field('username', newUsername)
        .attach('photo', pngBuffer, 'avatar.png')
        .expect(200);

      const user = response.body as UserResponseDto;

      expect(user.username).toEqual(newUsername);
      expect(user.photoUrl).toBeDefined();
      expect(user.photoUrl).toMatch(/\/public\/uploads\/profiles\//);
    });

    it('should not update fields not present in the DTO (like email)', async () => {
      const originalEmail = userData.email;

      await request(app)
        .put(`/api/users/${userData._id}`)
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .send({ email: 'hack@test.com' })
        .expect(200);

      const userInDb = await User.findById(userData._id);
      expect(userInDb?.email).toEqual(originalEmail);
    });

    it('should return 403 when trying to update someone else', async () => {
      const otherUser = await User.create({ username: 'other', email: 'other@t.com', password: 'p' });

      await request(app)
        .put(`/api/users/${otherUser._id.toString()}`)
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .field('username', 'hacker')
        .expect(403);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a specific user', async () => {
      await request(app)
        .delete(`/api/users/${userData._id}`)
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .expect(200);

      const check = await User.findById(userData._id);
      expect(check).toBeNull();

      await registerTestUser(app);
    });

    it('should return 403 when trying to delete someone else', async () => {
      const otherUser = await User.create({ username: 'other', email: 'other@t.com', password: 'p' });

      await request(app)
        .delete(`/api/users/${otherUser._id.toString()}`)
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .expect(403);
    });
  });
});
