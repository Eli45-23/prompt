
// /src/pages/api/prompt.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { generatePrompt } from '@/lib/generatePrompt';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { idea, model } = req.body;

  if (!idea || typeof idea !== 'string' || idea.length > 100) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  if (model !== 'veo3' && model !== 'flow') {
    return res.status(400).json({ message: 'Invalid model' });
  }

  const prompt = generatePrompt({ idea, model });

  res.status(200).json(prompt);
}
