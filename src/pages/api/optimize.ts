// /src/pages/api/optimize.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { optimizePrompt, type PromptOptimizationRequest } from '@/lib/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { idea, model, currentPrompt } = req.body;

  if (!idea || typeof idea !== 'string') {
    return res.status(400).json({ message: 'Invalid input: idea must be a non-empty string.' });
  }

  if (!model || !['veo3', 'flow', 'runway', 'pika'].includes(model)) {
    return res.status(400).json({ message: 'Invalid model specified.' });
  }

  try {
    const request: PromptOptimizationRequest = {
      idea,
      model,
      currentPrompt
    };

    const optimization = await optimizePrompt(request);
    
    console.log(`Prompt optimized using AI. Quality score: ${optimization.qualityScore}, Generated ${optimization.suggestions.length} suggestions`);

    res.status(200).json(optimization);
  } catch (error) {
    console.error('AI optimization failed:', error);
    res.status(500).json({ 
      message: 'AI optimization temporarily unavailable',
      fallback: {
        optimizedPrompt: `Create a high-quality video of ${idea} with professional cinematography and excellent visual composition.`,
        suggestions: [],
        qualityScore: 75,
        improvements: ['AI optimization unavailable']
      }
    });
  }
}