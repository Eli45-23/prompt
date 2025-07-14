// /src/pages/api/refine.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { refinePrompt } from '@/lib/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { prompt, model = 'veo3' } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ message: 'Invalid input: prompt must be a non-empty string.' });
  }

  try {
    const refinedPrompts = await refinePrompt(prompt, model);
    
    console.log(`Prompt refined using AI. Original length: ${prompt.length}, Generated ${refinedPrompts.length} variations`);

    // Return the first refined prompt as the main result, with alternatives
    res.status(200).json({ 
      refinedPrompt: refinedPrompts[0] || prompt,
      alternatives: refinedPrompts.slice(1),
      originalPrompt: prompt
    });
  } catch (error) {
    console.error('AI refinement failed:', error);
    // Fallback to enhanced prompt if AI fails
    const fallbackPrompt = `Enhanced: ${prompt} - with improved cinematic quality, professional lighting, and dynamic camera movements.`;
    res.status(200).json({ 
      refinedPrompt: fallbackPrompt,
      alternatives: [],
      originalPrompt: prompt,
      note: 'AI refinement unavailable, using fallback enhancement'
    });
  }
}