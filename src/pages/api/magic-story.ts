import { NextApiRequest, NextApiResponse } from 'next';
import { expandWordToStory } from '@/lib/openai';
import { generatePrompt } from '@/lib/generatePrompt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { word, model } = req.body;

    if (!word || !model) {
      return res.status(400).json({ error: 'Word and model are required' });
    }

    // Generate story expansion using AI
    const storyExpansion = await expandWordToStory(word, model);
    
    // Generate the final prompt using the expanded story
    const prompt = generatePrompt({
      idea: storyExpansion.fullStory,
      model,
      visualStyle: storyExpansion.visualStyle,
      cameraMovement: storyExpansion.cameraMovement,
      background: storyExpansion.background,
      lightingMood: storyExpansion.lightingMood,
      audioCues: storyExpansion.audioCues,
      colorPalette: storyExpansion.colorPalette,
      negativePrompts: model === 'veo3' ? 'blurry, low-quality, subtitles, text overlay' : 'blurry, low-quality, cartoonish'
    });

    res.status(200).json({ story: storyExpansion, prompt });
  } catch (error) {
    console.error('Magic story API error:', error);
    res.status(500).json({ error: 'Failed to generate magic story' });
  }
}