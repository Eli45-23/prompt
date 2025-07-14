// /src/pages/api/prompt.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { generatePrompt } from '@/lib/generatePrompt';
import type { GeneratedPrompt } from '@/lib/generatePrompt';

export const config = {
  runtime: 'edge',
};

// Simple in-memory cache and rate limiter
const cache = new Map<string, { prompt: GeneratedPrompt; timestamp: number }>();
const rateLimit = new Map<string, { count: number; lastReset: number }>();
const CACHE_TTL = 60 * 1000; // 60 seconds
const RATE_LIMIT_WINDOW = 10 * 1000; // 10 seconds
const MAX_REQUESTS = 5; // Max 5 requests per 10 seconds per IP

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Edge functions don't have direct access to req.socket.remoteAddress
  // Use x-forwarded-for for IP in edge environment
  const clientIp = req.headers['x-forwarded-for']?.toString() || 'unknown';

  // Rate Limiting
  const now = Date.now();
  const clientRate = rateLimit.get(clientIp) || { count: 0, lastReset: now };

  if (now - clientRate.lastReset > RATE_LIMIT_WINDOW) {
    clientRate.count = 1;
    clientRate.lastReset = now;
  } else {
    clientRate.count++;
  }
  rateLimit.set(clientIp, clientRate);

  if (clientRate.count > MAX_REQUESTS) {
    console.warn(`Rate limit exceeded for IP: ${clientIp}`);
    return res.status(429).json({ message: 'Too Many Requests' });
  }

  const { idea, model, visualStyle, cameraMovement, background, lightingMood, audioCues, colorPalette, negativePrompts } = req.body;

  if (!idea || typeof idea !== 'string' || idea.length > 100) {
    return res.status(400).json({ message: 'Invalid input: idea must be a non-empty string up to 100 characters.' });
  }

  const validModels = ['veo3', 'flow', 'runway', 'pika'];
  if (!model || !validModels.includes(model)) {
    return res.status(400).json({ message: `Invalid model: must be one of ${validModels.join(', ')}.` });
  }

  const cacheKey = JSON.stringify({ idea, model, visualStyle, cameraMovement, background, lightingMood, audioCues, colorPalette, negativePrompts });

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    console.log(`Cache hit for model: ${model}, prompt length: ${cached.prompt.assembledPrompt.length}`);
    return res.status(200).json(cached.prompt);
  }

  const prompt = generatePrompt({
    idea,
    model,
    visualStyle,
    cameraMovement,
    background,
    lightingMood,
    audioCues,
    colorPalette,
    negativePrompts,
  });

  // Store in cache
  cache.set(cacheKey, { prompt, timestamp: now });

  // Log for observability
  console.log(`Prompt generated for model: ${model}, prompt length: ${prompt.assembledPrompt.length}`);

  res.status(200).json(prompt);
}