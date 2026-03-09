import request from 'supertest';
import { type Express } from 'express';
import mongoose from 'mongoose';
import initApp from '../index';
import Comment, { type IComment } from '../models/comment';
import Post from '../models/post';
import { registerTestUser, userData, createTestComment, createTestPost } from './testUtils';

let app: Express;

beforeAll(async () => {
  app = await initApp();
  await registerTestUser(app);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Comment.deleteMany({});
  await Post.deleteMany({});
});

describe('Comments Controller Integration Tests', () => {
  const fakeId = new mongoose.Types.ObjectId().toString();

  describe('POST /comments', () => {
    it('should create a new comment successfully', async () => {
      const post = await createTestPost(userData._id);

      const commentData = {
        postId: post._id.toString(),
        content: 'Valid test comment',
      };

      const response = await request(app)
        .post('/comments')
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .send(commentData)
        .expect(201);

      const comment = response.body as IComment;
      expect(comment.content).toEqual(commentData.content);
      expect(comment.postId).toEqual(commentData.postId);
      expect(comment.senderId).toEqual(userData._id);
    });

    it('should return 401 if no authorization header is provided', async () => {
      await request(app).post('/comments').send({ content: 'comment', postId: fakeId }).expect(401);
    });

    it('should return 404 if the postId does not exist', async () => {
      await request(app)
        .post('/comments')
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .send({ postId: fakeId, content: 'Orphan comment' })
        .expect(404);
    });

    it('should return 500 if validation fails (missing content)', async () => {
      const post = await createTestPost(userData._id);
      await request(app)
        .post('/comments')
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .send({ postId: post._id })
        .expect(500);
    });

    it('should return 500 if content is an empty string (schema validation)', async () => {
      const post = await createTestPost(userData._id);
      await request(app)
        .post('/comments')
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .send({ postId: post._id, content: '' })
        .expect(500);
    });
  });

  describe('GET /comments', () => {
    it('should return all comments in the database', async () => {
      const post = await createTestPost(userData._id);
      await createTestComment(post._id.toString(), userData._id, 'C1');
      await createTestComment(post._id.toString(), userData._id, 'C2');

      const response = await request(app)
        .get('/comments')
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .expect(200);

      const comments = response.body as IComment[];
      expect(Array.isArray(comments)).toEqual(true);
      expect(comments).toHaveLength(2);
    });

    it('should return an empty array if no comments exist', async () => {
      const response = await request(app)
        .get('/comments')
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /comments/:id', () => {
    it('should return a specific comment by its ID', async () => {
      const post = await createTestPost(userData._id);
      const comment = await createTestComment(post._id.toString(), userData._id, 'Find me');

      const response = await request(app)
        .get(`/comments/${comment._id.toString()}`)
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .expect(200);

      const commentData = response.body as IComment;
      expect(commentData.content).toEqual('Find me');
      expect(commentData.postId).toEqual(post._id.toString());
      expect(commentData.senderId).toEqual(userData._id);
    });

    it('should return 404 for a non-existent but valid format ID', async () => {
      await request(app).get(`/comments/${fakeId}`).set('Authorization', `Bearer ${userData.accessToken}`).expect(404);
    });
  });

  describe('GET /comments/post/:id', () => {
    it('should filter comments by the post ID', async () => {
      const post1 = await createTestPost(userData._id);
      const post2 = await createTestPost(userData._id);
      await createTestComment(post1._id.toString(), userData._id, 'Comment for P1');
      await createTestComment(post2._id.toString(), userData._id, 'Comment for P2');

      const response = await request(app)
        .get(`/comments/post/${post1._id.toString()}`)
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .expect(200);

      const comments = response.body as IComment[];
      expect(comments).toHaveLength(1);
      expect(comments[0].content).toEqual('Comment for P1');
      expect(comments[0].postId).toEqual(post1._id.toString());
      expect(comments[0].senderId).toEqual(userData._id);
    });

    it('should return an empty array if a valid post ID has no comments', async () => {
      const post = await createTestPost(userData._id);

      const response = await request(app)
        .get(`/comments/post/${post._id.toString()}`)
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return 404 if searching comments for a non-existent post', async () => {
      await request(app)
        .get(`/comments/post/${fakeId}`)
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .expect(404);
    });
  });

  describe('PUT /comments/:id', () => {
    it('should update comment if active user is the sender', async () => {
      const post = await createTestPost(userData._id);
      const comment = await createTestComment(post._id.toString(), userData._id, 'Old text');

      const response = await request(app)
        .put(`/comments/${comment._id.toString()}`)
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .send({ content: 'New text' })
        .expect(200);

      const updatedComment = response.body as IComment;

      expect(updatedComment.content).toEqual('New text');
      expect(updatedComment.postId).toEqual(post._id.toString());
      expect(updatedComment.senderId).toEqual(userData._id);
    });

    it('should return 404 if user is NOT the sender', async () => {
      const post = await createTestPost(userData._id);
      const otherComment = await Comment.create({
        postId: post._id,
        senderId: fakeId,
        content: 'Not my comment',
      });

      await request(app)
        .put(`/comments/${otherComment._id.toString()}`)
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .send({ content: 'attempt' })
        .expect(404);
    });

    it('should return 401 if trying to update without a token', async () => {
      const postId = new mongoose.Types.ObjectId().toString();
      const comment = await createTestComment(postId, userData._id, 'Locked text');

      await request(app).put(`/comments/${comment._id.toString()}`).send({ content: 'Unauthorized' }).expect(401);
    });
  });

  describe('DELETE /comments/:id', () => {
    it('should delete a comment if active user is the sender', async () => {
      const post = await createTestPost(userData._id);
      const comment = await createTestComment(post._id.toString(), userData._id, 'Delete me');

      await request(app)
        .delete(`/comments/${comment._id.toString()}`)
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .expect(200);

      const check = await Comment.findById(comment._id);
      expect(check).toBeNull();
    });

    it('should return 404 if active user tries to delete someone else’s comment', async () => {
      const postId = new mongoose.Types.ObjectId().toString();
      const otherComment = await Comment.create({
        postId,
        senderId: fakeId,
        content: 'Stranger comment',
      });

      await request(app)
        .delete(`/comments/${otherComment._id.toString()}`)
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .expect(404);

      const check = await Comment.findById(otherComment._id);
      expect(check).not.toBeNull();
    });
  });
});
