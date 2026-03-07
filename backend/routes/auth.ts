import { Router } from 'express';
import { register, login, logout, refreshToken, getCurrentUser } from '../controllers/auth';
import { authMiddleware } from '../middleware/auth.middleware';
import { profileImageMiddleware } from '../middleware/upload.middleware';

const router: Router = Router();

router.post('/register', profileImageMiddleware, register);

router.get('/me', authMiddleware, getCurrentUser);

router.post('/login', login);

router.post('/logout', logout);

router.post('/refreshToken', refreshToken);

export default router;
