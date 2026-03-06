import { Router } from 'express';
import { register, login, logout, refreshToken, getCurrentUser } from '../controllers/auth';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadProfileImage } from '../utils/storage';

const router: Router = Router();

router.post('/register', uploadProfileImage.single('photo'), register);

router.get('/me', authMiddleware, getCurrentUser);

router.post('/login', login);

router.post('/logout', logout);

router.post('/refreshToken', refreshToken);

export default router;
