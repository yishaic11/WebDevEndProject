import type { Request, Response } from 'express';
import Post from '../models/post';
import { type CreatePostDto, type LikePostDto, type UpdatePostDto } from '../dtos/post.dto';
import { handlePostLikeToggle } from '../utils/likes';
import { getActiveUserId } from '../utils/auth';
import { getBaseUrl } from '../utils/url';
import { sendError } from '../utils';
import type { IdParam } from '../types/common';

interface PostsSenderIDQueryParam {
  sender?: string;
}

export const createPost = async (
  req: Request<Record<string, string>, unknown, CreatePostDto>,
  res: Response,
): Promise<void> => {
  const { content } = req.body;

  try {
    const senderId = getActiveUserId(req);

    let photoUrl: string;
    if (req.file) {
      const base = getBaseUrl();
      const filePath = req.file.path.replace(/\\/g, '/');
      photoUrl = `${base}${filePath}`;
    } else {
      return sendError(res, 400, 'Photo is required to create a post');
    }

    const createdPost = await Post.create({
      content,
      photoUrl,
      senderId,
      likes: [],
    });

    res.json(createdPost);
  } catch {
    sendError(res, 500, `Failed to create post`);
  }
};

export const getAllPosts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const posts = await Post.find();

    res.json(posts);
  } catch {
    sendError(res, 500, `Failed to get all posts`);
  }
};

export const getPostById = async (req: Request<IdParam>, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);
    if (!post) {
      return sendError(res, 500, `Post not found for id: ${id}`);
    }

    res.json(post);
  } catch {
    sendError(res, 500, `Failed to get post by Id: ${id}`);
  }
};

export const getPostsBySenderId = async (
  req: Request<unknown, unknown, unknown, PostsSenderIDQueryParam>,
  res: Response,
): Promise<void> => {
  const { sender: senderId = '' } = req.query;

  try {
    if (!senderId) {
      return sendError(res, 400, 'Sender ID query parameter is required');
    }

    const posts = await Post.find({ senderId });
    res.json(posts);
  } catch {
    sendError(res, 500, `Failed to get posts by sender Id: ${senderId}`);
  }
};

export const updatePost = async (req: Request<IdParam, unknown, UpdatePostDto>, res: Response): Promise<void> => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const activeUserId = getActiveUserId(req);

    const posts = await Post.find({ _id: id, senderId: activeUserId });
    if (posts.length === 0) {
      return sendError(res, 404, `Post not found for id: ${id} or user is not the sender`);
    }
    const post = posts[0];

    post.content = content ? content : post.content;

    if (req.file) {
      const base = getBaseUrl();
      const filePath = req.file.path.replace(/\\/g, '/');
      post.photoUrl = `${base}${filePath}`;
    }

    await post.save();

    res.json(post);
  } catch {
    sendError(res, 500, `Failed to update post with id: ${id} using data: ${JSON.stringify({ content })}`);
  }
};

export const toggleLike = async (
  req: Request<Record<string, string>, unknown, LikePostDto>,
  res: Response,
): Promise<void> => {
  const { postId } = req.body;

  try {
    const userId = getActiveUserId(req);

    await handlePostLikeToggle(postId, userId);
    res.json({ message: 'Like toggled successfully' });
  } catch {
    sendError(res, 500, `Failed to toggle like for post Id: ${postId}`);
  }
};

export const deletePost = async (req: Request<IdParam>, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const activeUserId = getActiveUserId(req);

    const posts = await Post.find({ _id: id, senderId: activeUserId });
    if (posts.length === 0) {
      const message = `Post not found for id: ${id} or user is not the sender`;
      res.status(404).json({ message });
      throw new Error(message);
    }
    const post = posts[0];

    // TODO: Delete all comments of the deleted post once comments are implemented
    await post.deleteOne();

    res.json(post);
  } catch {
    sendError(res, 500, `Failed to delete post with id: ${id}`);
  }
};
