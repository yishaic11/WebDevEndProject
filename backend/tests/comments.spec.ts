import request from 'supertest';
import { type Express } from 'express';
import mongoose from 'mongoose';
import initApp from '../index';
import Comment, { type IComment } from '../models/comment';
import { registerTestUser, userData, createTestComment } from './testUtils';

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
});

describe('Comments Controller Integration Tests', () => {
  const fakeId = new mongoose.Types.ObjectId().toString();
  const invalidId = 'not-a-valid-id-123';

  describe('POST /comments', () => {
    it('should create a new comment successfully', async () => {
      const postId = new mongoose.Types.ObjectId().toString();
      const commentData = {
        postId,
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

    it('should return 500 if validation fails (missing content)', async () => {
      const postId = new mongoose.Types.ObjectId().toString();
      await request(app)
        .post('/comments')
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .send({ postId })
        .expect(500);
    });

    it('should return 500 if content is an empty string (schema validation)', async () => {
      await request(app)
        .post('/comments')
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .send({ postId: fakeId, content: '' })
        .expect(500);
    });
  });

  describe('GET /comments', () => {
    it('should return all comments in the database', async () => {
      const postId = new mongoose.Types.ObjectId().toString();
      await createTestComment(postId, userData._id, 'C1');
      await createTestComment(postId, userData._id, 'C2');

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
      const postId = new mongoose.Types.ObjectId().toString();
      const comment = await createTestComment(postId, userData._id, 'Find me');

      const response = await request(app)
        .get(`/comments/${comment._id.toString()}`)
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .expect(200);

      const commentData = response.body as IComment;
      expect(commentData.content).toEqual('Find me');
      expect(commentData.postId).toEqual(postId);
      expect(commentData.senderId).toEqual(userData._id);
    });

    it('should return 500 for a non-existent but valid format ID', async () => {
      await request(app).get(`/comments/${fakeId}`).set('Authorization', `Bearer ${userData.accessToken}`).expect(500);
    });

    it('should return 500 for a malformed ID string', async () => {
      await request(app)
        .get(`/comments/${invalidId}`)
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .expect(500);
    });
  });

  describe('GET /comments/post/:id', () => {
    it('should filter comments by the post ID', async () => {
      const postId1 = new mongoose.Types.ObjectId().toString();
      const postId2 = new mongoose.Types.ObjectId().toString();
      await createTestComment(postId1, userData._id, 'Comment for P1');
      await createTestComment(postId2, userData._id, 'Comment for P2');

      const response = await request(app)
        .get(`/comments/post/${postId1}`)
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .expect(200);

      const comments = response.body as IComment[];

      expect(comments).toHaveLength(1);
      expect(comments[0].content).toEqual('Comment for P1');
      expect(comments[0].postId).toEqual(postId1);
      expect(comments[0].senderId).toEqual(userData._id);
    });

    it('should return an empty array if a valid post ID has no comments', async () => {
      const response = await request(app)
        .get(`/comments/post/${fakeId}`)
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .expect(200); // Note: Expected behavior for empty list is usually 200 []

      expect(response.body).toEqual([]);
    });
  });

  describe('PUT /comments/:id', () => {
    it('should update comment if active user is the sender of the comment', async () => {
      const postId = new mongoose.Types.ObjectId().toString();
      const comment = await createTestComment(postId, userData._id, 'Old text');

      const response = await request(app)
        .put(`/comments/${comment._id.toString()}`)
        .set('Authorization', `Bearer ${userData.accessToken}`)
        .send({ content: 'New text' })
        .expect(200);

      const updatedComment = response.body as IComment;

      expect(updatedComment.content).toEqual('New text');
      expect(updatedComment.postId).toEqual(postId);
      expect(updatedComment.senderId).toEqual(userData._id);
    });

    it('should return 404 if active user is NOT the sender of the comment', async () => {
      const postId = new mongoose.Types.ObjectId().toString();
      const otherComment = await Comment.create({
        postId,
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
    it('should delete a comment if active user is the sender of the comment', async () => {
      const postId = new mongoose.Types.ObjectId().toString();
      const comment = await createTestComment(postId, userData._id, 'Delete me');

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
