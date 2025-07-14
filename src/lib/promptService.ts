// Unified prompt service that works in both server and static environments
import { generatePrompt as generateBasicPrompt } from './generatePrompt';
import type { GeneratedPrompt } from './generatePrompt';
import { 
  optimizePrompt, 
  generateSuggestions, 
  refinePrompt, 
  analyzePromptQuality,
  generateCinematicElements,
  generateStoryVariations,
  type StoryExpansion,
  type CinematicElements
} from './openai';

// Re-export types for external use
export type { StoryExpansion, CinematicElements } from './openai';

// Simple environment detection for legacy services
const isStaticEnvironment = () => {
  if (typeof window === 'undefined') return false; // Server-side
  return process.env.NODE_ENV === 'production' && 
         window.location.hostname.includes('github.io');
};


// Basic prompt generation (works in all environments)
export const generatePromptService = async (params: {
  idea: string;
  model: 'veo3' | 'flow' | 'runway' | 'pika';
  visualStyle: string;
  cameraMovement: string;
  background: string;
  lightingMood: string;
  audioCues: string;
  colorPalette: string;
  negativePrompts: string;
}): Promise<GeneratedPrompt> => {
  
  if (isStaticEnvironment()) {
    // Use client-side generation for static builds
    return generateBasicPrompt(params);
  } else {
    // Use API route for server environments
    const response = await fetch('/api/prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate prompt');
    }
    
    return response.json();
  }
};

// AI suggestions service
export const getSuggestionsService = async (input: string): Promise<string[]> => {
  if (input.length < 3) return [];
  
  if (isStaticEnvironment()) {
    // Use client-side OpenAI for static builds
    try {
      return await generateSuggestions(input);
    } catch (error) {
      console.warn('AI suggestions unavailable:', error);
      return [];
    }
  } else {
    // Use API route for server environments
    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.warn('API suggestions unavailable:', error);
      return [];
    }
  }
};

// AI prompt analysis service
export const analyzePromptService = async (prompt: string): Promise<{score: number, feedback: string[]} | null> => {
  if (!prompt) return null;
  
  if (isStaticEnvironment()) {
    // Use client-side OpenAI for static builds
    try {
      return await analyzePromptQuality(prompt);
    } catch (error) {
      console.warn('AI analysis unavailable:', error);
      return null;
    }
  } else {
    // Use API route for server environments
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) return null;
      
      return response.json();
    } catch (error) {
      console.warn('API analysis unavailable:', error);
      return null;
    }
  }
};

// AI prompt refinement service
export const refinePromptService = async (prompt: string, model: string): Promise<string> => {
  if (!prompt) return prompt;
  
  if (isStaticEnvironment()) {
    // Use client-side OpenAI for static builds
    try {
      const refinements = await refinePrompt(prompt, model);
      return refinements[0] || prompt; // Return first refinement
    } catch (error) {
      console.warn('AI refinement unavailable:', error);
      return prompt;
    }
  } else {
    // Use API route for server environments
    try {
      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model }),
      });
      
      if (!response.ok) return prompt;
      
      const data = await response.json();
      return data.refinedPrompt || prompt;
    } catch (error) {
      console.warn('API refinement unavailable:', error);
      return prompt;
    }
  }
};

// AI prompt optimization service
export const optimizePromptService = async (idea: string, model: string, currentPrompt?: string): Promise<{optimizedPrompt?: string, qualityScore?: number, improvements?: string[]}> => {
  if (!idea) return {};
  
  if (isStaticEnvironment()) {
    // Use client-side OpenAI for static builds
    try {
      const result = await optimizePrompt({ idea, model: model as 'veo3' | 'flow' | 'runway' | 'pika', currentPrompt });
      return {
        optimizedPrompt: result.optimizedPrompt,
        qualityScore: result.qualityScore,
        improvements: result.improvements
      };
    } catch (error) {
      console.warn('AI optimization unavailable:', error);
      return {};
    }
  } else {
    // Use API route for server environments
    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, model, currentPrompt }),
      });
      
      if (!response.ok) return {};
      
      return response.json();
    } catch (error) {
      console.warn('API optimization unavailable:', error);
      return {};
    }
  }
};

// Magic Mode: One-word story generation service
export const generateMagicStoryService = async (word: string, model: 'veo3' | 'flow' | 'runway' | 'pika'): Promise<{story: StoryExpansion, prompt: GeneratedPrompt}> => {
  if (!word) throw new Error('Word is required for Magic Mode');

  console.log('Magic Service: Starting generation for word:', word, 'model:', model);

  // Always try API route first (most secure and reliable)
  try {
    console.log('Magic Service: Attempting API route...');
    const response = await fetch('/api/magic-story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word, model }),
    });
    
    if (response.ok) {
      console.log('Magic Service: API route successful');
      return response.json();
    } else {
      console.log('Magic Service: API route failed with status:', response.status);
    }
  } catch (error) {
    console.log('Magic Service: API route not available:', error);
  }

  // Fallback: Use predefined story templates for static environments
  console.log('Magic Service: Using fallback story templates');
  return generateFallbackStory(word, model);
};

// Fallback story generation using predefined templates
const generateFallbackStory = (word: string, model: 'veo3' | 'flow' | 'runway' | 'pika'): {story: StoryExpansion, prompt: GeneratedPrompt} => {
  // Predefined story templates based on common words
  const storyTemplates = {
    cat: {
      fullStory: "A curious orange tabby cat slowly approaches a windowsill, its emerald eyes reflecting the warm afternoon sunlight as it gracefully leaps up to watch birds outside",
      visualStyle: "cinematic realism with warm, natural lighting",
      cameraMovement: "slow dolly in following the cat's movement",
      background: "cozy living room with soft afternoon light streaming through curtains",
      lightingMood: "warm, golden hour lighting with soft shadows",
      audioCues: model === 'veo3' ? "gentle purring, soft ambient room sounds, distant birds chirping outside" : "ambient room atmosphere with subtle nature sounds",
      colorPalette: "warm oranges, soft creams, and golden highlights",
      characterDetails: "Orange tabby cat with distinctive green eyes and white chest markings",
      actionSequence: "Cat walking > pausing > looking up > graceful leap > settling on windowsill",
      storyMood: "peaceful, contemplative, and heartwarming"
    },
    sunset: {
      fullStory: "A lone figure stands on a cliff overlooking the ocean as the sun slowly sets, painting the sky in brilliant oranges and purples while waves gently crash below",
      visualStyle: "epic cinematic landscape with dramatic lighting",
      cameraMovement: "slow aerial pull-back revealing the vastness",
      background: "dramatic coastal cliff with endless ocean horizon",
      lightingMood: "golden hour with dramatic silhouetting and color gradients",
      audioCues: model === 'veo3' ? "gentle ocean waves, soft wind, peaceful ambient atmosphere" : "nature soundscape with ocean and wind",
      colorPalette: "brilliant oranges, deep purples, and golden highlights",
      characterDetails: "Silhouetted figure in contemplative pose",
      actionSequence: "Figure standing > wind moving clothing > sun descending > colors intensifying",
      storyMood: "contemplative, peaceful, and awe-inspiring"
    },
    city: {
      fullStory: "Neon lights reflect on wet streets as a person walks through a bustling urban environment, the city alive with energy and movement around them",
      visualStyle: "neo-noir cinematic with neon lighting",
      cameraMovement: "tracking shot following the subject",
      background: "modern cityscape with neon signs and wet pavement",
      lightingMood: "moody with neon reflections and dramatic shadows",
      audioCues: model === 'veo3' ? "urban ambiance, distant traffic, footsteps on wet pavement" : "city atmosphere with urban sounds",
      colorPalette: "neon blues, purples, and warm streetlight yellows",
      characterDetails: "Person in modern urban clothing",
      actionSequence: "Walking > navigating crowd > neon reflections > urban rhythm",
      storyMood: "energetic, modern, and atmospheric"
    }
  };

  // Get template or create generic one
  const template = storyTemplates[word.toLowerCase() as keyof typeof storyTemplates] || {
    fullStory: `A cinematic moment featuring ${word}, captured in stunning detail with professional cinematography and compelling visual storytelling`,
    visualStyle: "cinematic realism with professional lighting",
    cameraMovement: "smooth camera movement enhancing the narrative",
    background: `environment that complements the ${word} theme`,
    lightingMood: "professional lighting that enhances mood and atmosphere",
    audioCues: model === 'veo3' ? `ambient sounds related to ${word} with natural audio` : `atmospheric sounds complementing ${word}`,
    colorPalette: "professionally balanced color scheme",
    characterDetails: `Elements featuring ${word} with attention to detail`,
    actionSequence: `8-second sequence showcasing ${word} in cinematic fashion`,
    storyMood: "engaging and visually compelling"
  };

  // Generate the final prompt using the template
  const prompt = generateBasicPrompt({
    idea: template.fullStory,
    model,
    visualStyle: template.visualStyle,
    cameraMovement: template.cameraMovement,
    background: template.background,
    lightingMood: template.lightingMood,
    audioCues: template.audioCues,
    colorPalette: template.colorPalette,
    negativePrompts: model === 'veo3' ? 'blurry, low-quality, subtitles, text overlay' : 'blurry, low-quality, cartoonish'
  });

  return { story: template, prompt };
};

// Generate story variations service
export const generateStoryVariationsService = async (originalStory: string, model: string): Promise<string[]> => {
  if (!originalStory) return [];

  if (isStaticEnvironment()) {
    // Use client-side OpenAI for static builds
    try {
      return await generateStoryVariations(originalStory, model);
    } catch (error) {
      console.warn('AI story variations unavailable:', error);
      return [];
    }
  } else {
    // Use API route for server environments
    try {
      const response = await fetch('/api/story-variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story: originalStory, model }),
      });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.variations || [];
    } catch (error) {
      console.warn('API story variations unavailable:', error);
      return [];
    }
  }
};

// Enhanced cinematic elements generation service
export const generateCinematicElementsService = async (storyContext: string, model: 'veo3' | 'flow' | 'runway' | 'pika'): Promise<CinematicElements | null> => {
  if (!storyContext) return null;

  if (isStaticEnvironment()) {
    // Use client-side OpenAI for static builds
    try {
      return await generateCinematicElements(storyContext, model);
    } catch (error) {
      console.warn('AI cinematic elements unavailable:', error);
      return null;
    }
  } else {
    // Use API route for server environments
    try {
      const response = await fetch('/api/cinematic-elements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyContext, model }),
      });
      
      if (!response.ok) return null;
      
      return response.json();
    } catch (error) {
      console.warn('API cinematic elements unavailable:', error);
      return null;
    }
  }
};