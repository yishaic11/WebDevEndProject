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
import { uploadPostImage } from '../utils/storage';

const router: Router = Router();

router.get('/all', authMiddleware, getAllPosts);

router.get('/:id', authMiddleware, getPostById);

router.get('/', authMiddleware, getPostsBySenderId);

router.post('/', authMiddleware, uploadPostImage.single('photo'), createPost);

router.put('/:id', authMiddleware, uploadPostImage.single('photo'), updatePost);

router.patch('/like', authMiddleware, toggleLike);

router.delete('/:id', authMiddleware, deletePost);

export default router;
