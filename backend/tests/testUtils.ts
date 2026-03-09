import User from '../models/user';
import Post, { type IPost } from '../models/post';
import type { Express } from 'express';
import request from 'supertest';
import type { UserResponseDto } from '../dtos/user.dto';
import type { AuthTokensDtoWithId } from '../types/auth';

export const userData = {
  email: 'test@gmail.com',
  password: 'testPassword123',
  username: '',
  _id: '',
  accessToken: '',
  refreshToken: '',
};

export const createTestPost = async (senderId: string, content?: string): Promise<IPost> => {
  const post = await Post.create({
    senderId,
    content: content || 'Test post content',
    photoUrl: 'http://localhost/public/uploads/posts/dummy.png',
  });

  return post;
};

export const registerTestUser = async (app: Express) => {
  await User.deleteMany({ email: userData.email });

  const uniqueUsername = 'testuser_' + Math.random().toString(36).substring(7);

  const registerRes: {
    body: UserResponseDto;
  } = await request(app).post('/auth/register').send({
    username: uniqueUsername,
    email: userData.email,
    password: userData.password,
  });

  const loginRes: {
    body: AuthTokensDtoWithId;
  } = await request(app).post('/auth/login').send({
    username: uniqueUsername,
    password: userData.password,
  });

  userData._id = loginRes.body._id || registerRes.body._id;
  userData.accessToken = loginRes.body.accessToken;
  userData.refreshToken = loginRes.body.refreshToken;
  userData.username = uniqueUsername;

  if (!userData._id) {
    const userInDb = await User.findOne({ email: userData.email });
    userData._id = userInDb?._id.toString() || '';
  }

  return userData;
};
