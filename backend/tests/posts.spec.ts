import request from 'supertest';
import { type Express } from 'express';
import mongoose from 'mongoose';
import initApp from '../index';
import Post, { type IPost } from '../models/post';
import { registerTestUser, userData, createTestPost } from './testUtils';

let app: Express;

beforeAll(async () => {
  app = await initApp();
  await registerTestUser(app);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Post.deleteMany({});
});

interface PostResponseBody {
  _id: string;
  content: string;
  photoUrl?: string;
}

const pngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI6QAAAABJRU5ErkJggg==',
  'base64',
);

describe('Posts Controller Integration', () => {
  const fakeId = new mongoose.Types.ObjectId().toString();

  describe('POST /posts', () => {
    it('should create a post and return 200', async () => {
      const response = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .send({
          content: 'Hello World',
        })
        .expect(200);

      const post = response.body as IPost;
      expect(post.content).toEqual('Hello World');
      expect(post.senderId).toEqual(userData._id);
    });

    it('should create a post with a photo', async () => {
      const res = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .field('content', 'My photo post')
        .attach('photo', pngBuffer, 'post.png')
        .expect(200);

      const body = res.body as PostResponseBody;
      expect(body).toHaveProperty('content', 'My photo post');
      expect(body).toHaveProperty('photoUrl');
      expect(typeof body.photoUrl).toBe('string');
      expect(body.photoUrl).toMatch(/\/public\/uploads\/posts\//);
    });

    it('should create a post without a photo', async () => {
      const res = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .send({ content: 'Text only post' })
        .expect(200);

      const noPhotoBody = res.body as PostResponseBody;
      expect(noPhotoBody.content).toBe('Text only post');
      expect(noPhotoBody.photoUrl).toBeUndefined();
    });
  });

  describe('GET /posts/all', () => {
    it('should retrieve all posts', async () => {
      await createTestPost(userData._id, 'Post 1');
      await createTestPost(userData._id, 'Post 2');

      const response = await request(app)
        .get('/posts/all')
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .expect(200);

      const posts = response.body as IPost[];
      expect(posts.length).toEqual(2);
    });
  });

  describe('GET /posts/:id', () => {
    it('should return a post by ID', async () => {
      const post = await createTestPost(userData._id, 'Find me by ID');

      const response = await request(app)
        .get(`/posts/${post._id.toString()}`)
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .expect(200);

      expect((response.body as IPost).content).toEqual('Find me by ID');
    });

    it('should return 500 when post does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      await request(app)
        .get(`/posts/${nonExistentId}`)
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .expect(500);
    });
  });

  describe('GET /posts (By Sender)', () => {
    it('should filter posts by senderId', async () => {
      await createTestPost(userData._id, 'My Post');

      await Post.create({ senderId: fakeId, content: 'Other Post' });

      const response = await request(app)
        .get(`/posts?sender=${userData._id}`)
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .expect(200);

      const posts = response.body as IPost[];
      expect(posts.length).toEqual(1);
      expect(posts[0].content).toEqual('My Post');
    });

    it('should return 400 when sender query param is missing', async () => {
      await request(app).get('/posts').set('Authorization', `Bearer ${userData.accessToken}`).expect(400);
    });
  });

  describe('PUT /posts/:id', () => {
    it('should update post content if active user is the sender', async () => {
      const post = await createTestPost(userData._id, 'Old Content');
      const response = await request(app)
        .put(`/posts/${post._id.toString()}`)
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .send({ content: 'New Content' })
        .expect(200);

      const updatedPost = response.body as IPost;
      expect(updatedPost.content).toEqual('New Content');
    });

    it('should return 404 if active user is not the sender', async () => {
      const otherUserPost = await Post.create({ senderId: fakeId, content: 'Not Mine' });

      await request(app)
        .put(`/posts/${otherUserPost._id.toString()}`)
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .send({ content: 'Trying to hack' })
        .expect(404);
    });

    it('should update a post and replace the photo', async () => {
      const createRes = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .send({ content: 'Original content' })
        .expect(200);

      const postId = (createRes.body as { _id: string })._id;

      const updateRes = await request(app)
        .put(`/posts/${postId}`)
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .field('content', 'Updated content')
        .attach('photo', pngBuffer, 'updated.png')
        .expect(200);

      const updatedBody = updateRes.body as PostResponseBody;
      expect(updatedBody.content).toBe('Updated content');
      expect(updatedBody.photoUrl).toMatch(/\/public\/uploads\/posts\//);
    });
  });

  describe('PATCH /posts/like', () => {
    it('should like an unliked post', async () => {
      const post = await createTestPost(userData._id, 'Like me');

      const response = await request(app)
        .patch('/posts/like')
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .send({ postId: post._id.toString() })
        .expect(200);

      expect((response.body as { message: string }).message).toEqual('Like toggled successfully');

      const likedPost = await Post.findById(post._id);
      expect(likedPost?.likes).toContainEqual(new mongoose.Types.ObjectId(userData._id));
    });

    it('should unlike a liked post', async () => {
      const post = await createTestPost(userData._id, 'Like me');
      post.likes.push(new mongoose.Types.ObjectId(userData._id));
      await post.save();

      const response = await request(app)
        .patch('/posts/like')
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .send({ postId: post._id.toString() })
        .expect(200);

      expect((response.body as { message: string }).message).toEqual('Like toggled successfully');

      const unlikedPost = await Post.findById(post._id);
      expect(unlikedPost?.likes).not.toContainEqual(new mongoose.Types.ObjectId(userData._id));
    });
  });

  describe('DELETE /posts/:id', () => {
    it('should fail deletion if user is not the owner', async () => {
      const otherPost = await Post.create({ senderId: fakeId, content: 'Owner is fakeId' });

      await request(app)
        .delete(`/posts/${otherPost._id.toString()}`)
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .expect(404);
    });
  });
});
