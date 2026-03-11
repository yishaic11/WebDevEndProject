import type { Request, Response } from 'express';
import Comment from '../models/comment';
import type { CreateCommentDto, UpdateCommentDto } from '../dtos/comment.dto';
import { getActiveUserId } from '../utils/auth';
import type { IdParam } from '../types/common';
import { sendError } from '../utils';
import Post from '../models/post';
import type mongoose from 'mongoose';
import User from '../models/user';

interface PopulatedSender {
  _id: mongoose.Types.ObjectId;
  username: string;
  photoUrl?: string;
}

export const createComment = async (
  req: Request<Record<string, string>, unknown, CreateCommentDto>,
  res: Response,
): Promise<void> => {
  const newCommentData = req.body;

  try {
    const senderId = getActiveUserId(req);

    const post = await Post.findById(newCommentData.postId);
    if (!post) {
      return sendError(res, 404, `Post not found for Id: ${newCommentData.postId}`);
    }

    const newComment = await Comment.create({ ...newCommentData, senderId });

    const user = await User.findById(senderId);

    const responseData = {
      _id: newComment._id.toString(),
      content: newComment.content,
      postId: newComment.postId.toString(),
      senderId,
      photoUrl: user?.photoUrl,
      username: user?.username,
    };

    res.status(201).json(responseData);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    sendError(res, 500, `Failed to create comment: ${message}`);
  }
};

export const getAllComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const comments = await Comment.find();

    res.json(comments);
  } catch {
    sendError(res, 500, `Failed to get all comments`);
  }
};

export const getCommentById = async (req: Request<IdParam>, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const comment = await Comment.findById(id);
    if (!comment) {
      return sendError(res, 404, `Comment not found for id: ${id}`);
    }
    res.json(comment);
  } catch {
    sendError(res, 500, `Failed to get comment with id: ${id}`);
  }
};

export const getCommentsByPostId = async (req: Request<IdParam>, res: Response): Promise<void> => {
  const { id: postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return sendError(res, 404, `Post not found for Id: ${postId}`);
    }

    const rawComments = await Comment.find({ postId })
      .populate<{ senderId: PopulatedSender }>('senderId', 'photoUrl username')
      .lean();

    const comments = rawComments.map((comment) => {
      const sender = comment.senderId;

      return {
        _id: comment._id,
        content: comment.content,
        postId: comment.postId.toString(),
        senderId: sender._id.toString(),
        photoUrl: sender?.photoUrl,
        username: sender.username,
      };
    });

    res.json(comments);
  } catch {
    sendError(res, 500, `Failed to get comments for post with id: ${postId}`);
  }
};

export const updateComment = async (req: Request<IdParam, unknown, UpdateCommentDto>, res: Response): Promise<void> => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const activeUserId = getActiveUserId(req);

    const comments = await Comment.find({ _id: id, senderId: activeUserId });
    if (comments.length === 0) {
      return sendError(res, 404, `Comment not found for id: ${id} or user is not the sender`);
    }

    const comment = comments[0];
    comment.content = content;
    await comment.save();

    res.json(comment);
  } catch {
    sendError(res, 500, `Failed to update comment with id ${id} using data: ${JSON.stringify({ content })}`);
  }
};

export const deleteComment = async (req: Request<IdParam>, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const activeUserId = getActiveUserId(req);

    const comments = await Comment.find({ _id: id, senderId: activeUserId });
    if (comments.length === 0) {
      return sendError(res, 404, `Comment not found for id: ${id} or user is not the sender`);
    }

    const comment = comments[0];
    await comment.deleteOne();

    res.json(comment);
  } catch {
    sendError(res, 500, `Failed to delete comment with id: ${id}`);
  }
};
