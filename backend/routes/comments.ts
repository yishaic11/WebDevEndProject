import { Router } from 'express';
import {
  getAllComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  getCommentsByPostId,
} from '../controllers/comments';
import { authMiddleware } from '../middleware/auth.middleware';

const router: Router = Router();

router.get('/', authMiddleware, getAllComments);

router.get('/:id', authMiddleware, getCommentById);

router.get('/post/:id', authMiddleware, getCommentsByPostId);

router.post('/', authMiddleware, createComment);

router.put('/:id', authMiddleware, updateComment);

router.delete('/:id', authMiddleware, deleteComment);

export default router;
