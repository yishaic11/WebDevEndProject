import fs from 'fs';

import { GoogleGenAI } from '@google/genai';
import type { Request, Response } from 'express';
import { sendError } from '../utils';

export const generateDescription = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'No image provided. Please upload a photo.');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return sendError(res, 500, 'Gemini API key is not configured.');
    }

    const ai = new GoogleGenAI({ apiKey });

    const base64Image = fs.readFileSync(req.file.path, { encoding: 'base64' });
    const mimeType = req.file.mimetype as 'image/jpeg' | 'image/png' | 'image/webp';

    const prompt = `You are a creative social media caption writer.
    Look at this image and write an engaging and descriptive post caption for it.
    The caption must be a maximum of 500 characters including spaces.
    Do not use hashtags. Return only the caption text, nothing else.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ inlineData: { mimeType, data: base64Image } }, { text: prompt }],
    });

    let description = (response.text ?? '').trim();

    if (description.length > 500) {
      description = description.substring(0, 497) + '...';
    }

    fs.unlink(req.file.path, () => {});

    res.status(200).json({ description });
  } catch (error) {
    sendError(
      res,
      500,
      'Failed to generate description, details: ' + (error instanceof Error ? error.message : String(error)),
    );
  }
};
