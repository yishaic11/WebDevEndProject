import { Router } from 'express';
import { generateDescription } from '../controllers/ai';
import { authMiddleware } from '../middleware/auth.middleware';
import { tempImageMiddleware } from '../middleware/upload.middleware';

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: AI (Gemini API)
 *   description: AI content generation using Gemini API
 */

/**
 * @swagger
 * /api/ai/generate:
 *   post:
 *     summary: Generate a post description from an image using AI (Gemini API)
 *     tags: [AI (Gemini API)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Image to generate a description for
 *     responses:
 *       200:
 *         description: AI-generated description
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 description:
 *                   type: string
 *                   example: A beautiful sunset over the mountains with vibrant orange hues.
 *       400:
 *         description: Bad request - no image provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/generate', authMiddleware, tempImageMiddleware, generateDescription);

export default router;
