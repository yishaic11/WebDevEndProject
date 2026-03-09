import { Router } from 'express';
import {
  getAllPosts,
  getPostById,
  getPostsBySenderId,
  createPost,
  deletePost,
  updatePost,
  toggleLike,
} from '../controllers/posts';
import { authMiddleware } from '../middleware/auth.middleware';
import { postImageMiddleware } from '../middleware/upload.middleware';

const router: Router = Router();

router.get('/all', authMiddleware, getAllPosts);

router.get('/:id', authMiddleware, getPostById);

router.get('/', authMiddleware, getPostsBySenderId);

router.post('/', authMiddleware, postImageMiddleware, createPost);

router.put('/:id', authMiddleware, postImageMiddleware, updatePost);

router.patch('/like', authMiddleware, toggleLike);

router.delete('/:id', authMiddleware, deletePost);

export default router;
