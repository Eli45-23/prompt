import { NextApiRequest, NextApiResponse } from 'next';
import { generateStoryVariations } from '@/lib/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { story, model } = req.body;

    if (!story || !model) {
      return res.status(400).json({ error: 'Story and model are required' });
    }

    const variations = await generateStoryVariations(story, model);
    
    res.status(200).json({ variations });
  } catch (error) {
    console.error('Story variations API error:', error);
    res.status(500).json({ error: 'Failed to generate story variations' });
  }
}