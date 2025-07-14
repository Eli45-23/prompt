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
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }
  
  // Load appropriate shims first
  await loadOpenAIShims();
  
  // Dynamic import to avoid bundling issues
  const { default: OpenAI } = await import('openai');
  
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