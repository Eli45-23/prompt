// Unified prompt service that works in both server and static environments
import { generatePrompt as generateBasicPrompt } from './generatePrompt';
import type { GeneratedPrompt } from './generatePrompt';
import { 
  optimizePrompt, 
  generateSuggestions, 
  refinePrompt, 
  analyzePromptQuality,
  expandWordToStory,
  generateCinematicElements,
  generateStoryVariations,
  type StoryExpansion,
  type CinematicElements
} from './openai';

// Re-export types for external use
export type { StoryExpansion, CinematicElements } from './openai';

// Detect if we're in a static environment (no API routes available)
const isStaticEnvironment = () => {
  if (typeof window === 'undefined') return false; // Server-side
  
  // Check if we can make API calls (development/server environment)
  // In static builds, API routes return 404
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

  if (isStaticEnvironment()) {
    // Use client-side OpenAI for static builds
    try {
      const storyExpansion = await expandWordToStory(word, model);
      
      // Generate the final prompt using the expanded story
      const prompt = generateBasicPrompt({
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

      return { story: storyExpansion, prompt };
    } catch (error) {
      console.warn('AI story generation unavailable:', error);
      throw new Error('Magic Mode unavailable in current environment');
    }
  } else {
    // Use API route for server environments
    try {
      const response = await fetch('/api/magic-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, model }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate magic story');
      }
      
      return response.json();
    } catch (error) {
      console.warn('API magic story unavailable:', error);
      throw new Error('Magic Mode unavailable');
    }
  }
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