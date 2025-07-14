// /src/pages/api/analyze.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { analyzePromptQuality } from '@/lib/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ message: 'Invalid input: prompt must be a non-empty string.' });
  }

  try {
    const analysis = await analyzePromptQuality(prompt);
    
    console.log(`Analyzed prompt quality. Score: ${analysis.score}, Feedback points: ${analysis.feedback.length}`);

    res.status(200).json(analysis);
  } catch (error) {
    console.error('AI analysis failed:', error);
    // Provide basic fallback analysis
    const wordCount = prompt.split(' ').length;
    const hasSpecifics = /\b(cinematic|4k|8k|lighting|camera|angle|color|mood)\b/i.test(prompt);
    
    const fallbackScore = Math.min(95, Math.max(20, 
      (wordCount * 3) + (hasSpecifics ? 20 : 0) + (prompt.length > 50 ? 10 : 0)
    ));

    res.status(200).json({
      score: fallbackScore,
      feedback: [
        wordCount < 10 ? 'Consider adding more descriptive details' : 'Good detail level',
        hasSpecifics ? 'Contains relevant technical terms' : 'Could benefit from technical specifications',
        prompt.length > 100 ? 'Good comprehensive description' : 'Consider expanding the description'
      ].filter(Boolean),
      note: 'AI analysis unavailable, using basic evaluation'
    });
  }
}