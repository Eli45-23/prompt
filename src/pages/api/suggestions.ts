// /src/pages/api/suggestions.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { generateSuggestions } from '@/lib/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { input } = req.body;

  if (!input || typeof input !== 'string' || input.length < 2) {
    return res.status(200).json({ suggestions: [] });
  }

  try {
    const suggestions = await generateSuggestions(input);
    
    console.log(`Generated ${suggestions.length} AI suggestions for input: "${input}"`);

    res.status(200).json({ suggestions });
  } catch (error) {
    console.error('AI suggestions failed:', error);
    // Provide fallback suggestions
    const fallbackSuggestions = [
      `${input} in cinematic style`,
      `${input} with dramatic lighting`,
      `${input} in slow motion`,
      `${input} from unique angle`,
      `${input} with vibrant colors`
    ].filter(s => s.length < 50);

    res.status(200).json({ 
      suggestions: fallbackSuggestions,
      note: 'AI suggestions unavailable, using fallback'
    });
  }
}