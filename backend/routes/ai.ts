import { Router } from 'express';
import { generateDescription } from '../controllers/ai';
import { authMiddleware } from '../middleware/auth.middleware';
import { tempImageMiddleware } from '../middleware/upload.middleware';

const router: Router = Router();

router.post('/generate', authMiddleware, tempImageMiddleware, generateDescription);

export default router;
