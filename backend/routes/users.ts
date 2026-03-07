import { Router } from 'express';
import { deleteUser, getAllUsers, getUserById, updateUser } from '../controllers/users';
import { authMiddleware } from '../middleware/auth.middleware';
import { profileImageMiddleware } from '../middleware/upload.middleware';

const router: Router = Router();

router.get('/', authMiddleware, getAllUsers);

router.get('/:id', authMiddleware, getUserById);

router.put('/:id', authMiddleware, profileImageMiddleware, updateUser);

router.delete('/:id', authMiddleware, deleteUser);

export default router;
