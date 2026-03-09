import type { Request, Response } from 'express';
import Comment from '../models/comment';
import type { CreateCommentDto, UpdateCommentDto } from '../dtos/comment.dto';
import { getActiveUserId } from '../utils/auth';
import type { IdParam } from '../types/common';
import type { AuthenticatedRequest } from '../types/auth';
import { sendError } from '../utils';

export const createComment = async (
  req: AuthenticatedRequest<Record<string, string>, unknown, CreateCommentDto>,
  res: Response,
): Promise<void> => {
  const newCommentData = req.body;
  try {
    const senderId = getActiveUserId(req);

    //TODO - validate postId exists before querying
    const comment = await Comment.create({ ...newCommentData, senderId });

    res.status(201).json(comment);
  } catch {
    sendError(res, 500, `Failed to create comment with data: ${JSON.stringify(newCommentData)}`);
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
    if (!comment) throw new Error(`Comment not found for id: ${id}`);

    res.json(comment);
  } catch {
    sendError(res, 500, `Failed to get comment with id: ${id}`);
  }
};

export const getCommentsByPostId = async (req: Request<IdParam>, res: Response): Promise<void> => {
  const { id: postId } = req.params;

  try {
    //TODO - validate postId exists before querying
    const comments = await Comment.find({ postId });

    res.json(comments);
  } catch {
    sendError(res, 500, `Failed to get comments for post with id: ${postId}`);
  }
};

export const updateComment = async (
  req: AuthenticatedRequest<IdParam, unknown, UpdateCommentDto>,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const activeUserId = getActiveUserId(req);

    const comments = await Comment.find({ _id: id, senderId: activeUserId });
    if (comments.length === 0) {
      const message = `Comment not found for id: ${id} or user is not the sender`;
      res.status(404).json({ message });
      throw new Error(message);
    }

    const comment = comments[0];
    comment.content = content;
    await comment.save();

    res.json(comment);
  } catch {
    sendError(res, 500, `Failed to update comment with id ${id} using data: ${JSON.stringify({ content })}`);
  }
};

export const deleteComment = async (req: AuthenticatedRequest<IdParam>, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const activeUserId = getActiveUserId(req);

    const comments = await Comment.find({ _id: id, senderId: activeUserId });
    if (comments.length === 0) {
      const message = `Comment not found for id: ${id} or user is not the sender`;
      res.status(404).json({ message });
      throw new Error(message);
    }

    const comment = comments[0];
    await comment.deleteOne();

    res.json(comment);
  } catch {
    sendError(res, 500, `Failed to delete comment with id: ${id}`);
  }
};
