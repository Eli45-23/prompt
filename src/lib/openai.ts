// Dynamic shim loading based on environment
const loadOpenAIShims = async () => {
  if (typeof window === 'undefined') {
    // Server environment - load Node shims
    await import('openai/shims/node');
  } else {
    // Browser environment - load Web shims
    await import('openai/shims/web');
  }
};

// Create OpenAI instance that works in both server and client environments
const getOpenAI = async () => {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  
  console.log('OpenAI: Checking API key availability');
  console.log('OpenAI: Server key exists:', !!process.env.OPENAI_API_KEY);
  console.log('OpenAI: Client key exists:', !!process.env.NEXT_PUBLIC_OPENAI_API_KEY);
  console.log('OpenAI: Environment:', typeof window !== 'undefined' ? 'browser' : 'server');
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please set NEXT_PUBLIC_OPENAI_API_KEY for client-side usage.');
  }
  
  // Load appropriate shims first
  await loadOpenAIShims();
  
  // Dynamic import to avoid bundling issues
  const { default: OpenAI } = await import('openai');
  
  console.log('OpenAI: Creating instance with key length:', apiKey.length);
  
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: typeof window !== 'undefined', // Allow browser usage
  });
};

export interface PromptOptimizationRequest {
  idea: string;
  model: 'veo3' | 'flow' | 'runway' | 'pika';
  currentPrompt?: string;
}

export interface PromptSuggestion {
  prompt: string;
  score: number;
  reasoning: string;
  improvements: string[];
}

export interface OptimizationResponse {
  optimizedPrompt: string;
  suggestions: PromptSuggestion[];
  qualityScore: number;
  improvements: string[];
}

export interface StoryExpansion {
  fullStory: string;
  visualStyle: string;
  cameraMovement: string;
  background: string;
  lightingMood: string;
  audioCues: string;
  colorPalette: string;
  characterDetails: string;
  actionSequence: string;
  storyMood: string;
}

export interface CinematicElements {
  visualStyle: string;
  cameraMovement: string;
  background: string;
  lightingMood: string;
  audioCues: string;
  colorPalette: string;
}

export async function optimizePrompt(request: PromptOptimizationRequest): Promise<OptimizationResponse> {
  const systemPrompt = `You are an expert AI video prompt engineer specializing in ${request.model.toUpperCase()} video generation. 

Your task is to optimize video generation prompts for maximum quality and creativity. You understand:
- Technical requirements for ${request.model}
- Visual storytelling principles
- Cinematic techniques
- Lighting and composition
- Camera movements and angles

Respond with a JSON object containing:
{
  "optimizedPrompt": "The best possible prompt",
  "suggestions": [
    {
      "prompt": "Alternative suggestion",
      "score": 95,
      "reasoning": "Why this works well",
      "improvements": ["specific improvement 1", "improvement 2"]
    }
  ],
  "qualityScore": 95,
  "improvements": ["Key improvement areas"]
}`;

  const userPrompt = `Video idea: "${request.idea}"
Target model: ${request.model}
${request.currentPrompt ? `Current prompt: "${request.currentPrompt}"` : ''}

Please optimize this for ${request.model} and provide 3 alternative suggestions with quality scores.`;

  try {
    const openai = await getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(completion.choices[0].message.content || '{}');
    return response as OptimizationResponse;
  } catch (error) {
    console.error('OpenAI optimization error:', error);
    throw new Error('Failed to optimize prompt');
  }
}

export async function generateSuggestions(input: string): Promise<string[]> {
  if (input.length < 3) return [];

  const systemPrompt = `You are a creative AI that suggests video ideas. Given a partial input, suggest 5 creative, specific video concepts that complete or expand on the idea. Keep suggestions concise (under 15 words each).`;

  try {
    const openai = await getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Partial idea: "${input}"` }
      ],
      temperature: 0.9,
      max_tokens: 200
    });

    const response = completion.choices[0].message.content || '';
    return response.split('\n').filter(line => line.trim()).slice(0, 5);
  } catch (error) {
    console.error('OpenAI suggestions error:', error);
    return [];
  }
}

export async function refinePrompt(prompt: string, model: string): Promise<string[]> {
  const systemPrompt = `You are an expert prompt refiner for ${model.toUpperCase()} video generation. Take the given prompt and create 3 refined variations that:
1. Improve clarity and specificity
2. Enhance visual appeal
3. Add technical excellence

Return only the 3 refined prompts, one per line.`;

  try {
    const openai = await getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const response = completion.choices[0].message.content || '';
    return response.split('\n').filter(line => line.trim()).slice(0, 3);
  } catch (error) {
    console.error('OpenAI refine error:', error);
    throw new Error('Failed to refine prompt');
  }
}

export async function analyzePromptQuality(prompt: string): Promise<{score: number, feedback: string[]}> {
  const systemPrompt = `Analyze this video generation prompt and provide:
1. A quality score (0-100)
2. 3-5 specific feedback points

Focus on: clarity, specificity, visual appeal, technical accuracy, creativity.

Respond with JSON: {"score": 85, "feedback": ["point 1", "point 2"]}`;

  try {
    const openai = await getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 300,
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(completion.choices[0].message.content || '{"score": 50, "feedback": []}');
    return response;
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    return { score: 50, feedback: ['Unable to analyze prompt quality'] };
  }
}

export async function expandWordToStory(word: string, model: 'veo3' | 'flow' | 'runway' | 'pika'): Promise<StoryExpansion> {
  const modelSpecificGuidance = {
    veo3: `Focus on 8-second narratives with native audio integration. Include dialogue formatting: "Character says: 'dialogue content'". Emphasize realistic physics, character consistency, and cinematic audio (dialogue, ambient sounds, music). Consider camera positioning explicitly rather than generic viewpoints.`,
    flow: `Emphasize cinematic filmmaking techniques. Use ingredients-based approach with modular elements. Focus on professional cinematography, advanced camera movements (dolly zoom, rack focus, tracking shots), and scene building. Think like a professional filmmaker.`,
    runway: `Create visually striking content optimized for RunwayML's capabilities. Focus on strong visual concepts and clear motion.`,
    pika: `Design content optimized for Pika Labs with emphasis on creative visual effects and engaging motion.`
  };

  const systemPrompt = `You are an expert AI video story creator specializing in ${model.toUpperCase()} video generation. Your expertise includes:

- Google Veo 3 & Flow advanced prompting techniques (2025)
- Professional cinematography and filmmaking
- 8-second narrative storytelling
- Character consistency and visual continuity
- Advanced camera techniques (dolly zoom, rack focus, tracking shots, etc.)
- Audio-visual integration for ${model === 'veo3' ? 'native audio generation' : 'post-production audio'}

${modelSpecificGuidance[model]}

From a single word, create a complete 8-second cinematic story concept. Think of professional film production - every element should work together to create a compelling narrative moment.

Respond with JSON containing:
{
  "fullStory": "Complete 8-second story description",
  "visualStyle": "Specific visual aesthetic (e.g., 'cinematic realism', 'film noir', 'warm indie film')",
  "cameraMovement": "Professional camera technique (e.g., 'slow dolly zoom revealing character's realization', 'intimate handheld following movement')",
  "background": "Detailed environment description",
  "lightingMood": "Specific lighting setup and emotional tone",
  "audioCues": "${model === 'veo3' ? 'Dialogue, ambient sounds, and music with specific formatting' : 'Sound design and music description'}",
  "colorPalette": "Specific color scheme that supports the story",
  "characterDetails": "Detailed character description for consistency",
  "actionSequence": "Specific 8-second action breakdown",
  "storyMood": "Overall emotional tone and narrative purpose"
}`;

  const userPrompt = `Create a complete 8-second cinematic story from this single word: "${word}"

The story should be:
- Emotionally engaging and visually compelling
- Feasible to shoot in 8 seconds
- Rich in cinematic detail
- Optimized for ${model.toUpperCase()} generation
- Professional film quality

Be creative and imaginative - take the word in an unexpected but meaningful direction that creates a memorable moment.`;

  try {
    const openai = await getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(completion.choices[0].message.content || '{}');
    return response as StoryExpansion;
  } catch (error) {
    console.error('OpenAI story expansion error:', error);
    throw new Error('Failed to expand word to story');
  }
}

export async function generateCinematicElements(storyContext: string, model: 'veo3' | 'flow' | 'runway' | 'pika'): Promise<CinematicElements> {
  const systemPrompt = `You are a professional cinematographer and video prompt engineer specializing in ${model.toUpperCase()}. 

Based on a story context, generate optimal cinematic elements using 2025 best practices:

${model === 'veo3' ? `
- Use native audio integration techniques
- Include specific dialogue formatting: "Character speaking to camera saying: 'dialogue'"
- Specify camera positioning explicitly
- Add "(no subtitles)" to prevent text overlay
- Include ambient sounds and music descriptions
` : model === 'flow' ? `
- Think like a professional filmmaker
- Use advanced cinematic language (match cut, jump cut, establishing shot)
- Emphasize modular ingredient-based composition
- Include sophisticated camera movements (vertigo effect, rack focus)
` : `
- Focus on strong visual concepts for ${model}
- Optimize for platform-specific capabilities
`}

Respond with JSON:
{
  "visualStyle": "Specific aesthetic approach",
  "cameraMovement": "Professional camera technique",
  "background": "Detailed environment",
  "lightingMood": "Lighting setup and emotional tone", 
  "audioCues": "Audio design and music",
  "colorPalette": "Color scheme supporting the narrative"
}`;

  try {
    const openai = await getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Story context: ${storyContext}` }
      ],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(completion.choices[0].message.content || '{}');
    return response as CinematicElements;
  } catch (error) {
    console.error('OpenAI cinematic elements error:', error);
    throw new Error('Failed to generate cinematic elements');
  }
}

export async function generateStoryVariations(originalStory: string, model: string): Promise<string[]> {
  const systemPrompt = `You are a creative story developer. Take the given story concept and create 3 alternative interpretations of the same concept. Each should be:
- Equally engaging but different in approach
- Suitable for 8-second video generation
- Optimized for ${model.toUpperCase()}
- Creative and unexpected

Return only the 3 story variations, one per line.`;

  try {
    const openai = await getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: originalStory }
      ],
      temperature: 0.9,
      max_tokens: 600
    });

    const response = completion.choices[0].message.content || '';
    return response.split('\n').filter(line => line.trim()).slice(0, 3);
  } catch (error) {
    console.error('OpenAI story variations error:', error);
    return [];
  }
}