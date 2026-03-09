import fs from 'fs';

import { GoogleGenAI } from '@google/genai';
import type { Request, Response } from 'express';

export const generateDescription = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No image provided. Please upload a photo.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ message: 'Gemini API key is not configured.' });
      return;
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
    res.status(500).json({
      message: 'Failed to generate description',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
