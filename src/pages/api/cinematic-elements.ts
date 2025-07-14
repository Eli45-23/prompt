import { NextApiRequest, NextApiResponse } from 'next';
import { generateCinematicElements } from '@/lib/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { storyContext, model } = req.body;

    if (!storyContext || !model) {
      return res.status(400).json({ error: 'Story context and model are required' });
    }

    const elements = await generateCinematicElements(storyContext, model);
    
    res.status(200).json(elements);
  } catch (error) {
    console.error('Cinematic elements API error:', error);
    res.status(500).json({ error: 'Failed to generate cinematic elements' });
  }
}