// /src/tests/generatePrompt.test.ts

import { generatePrompt } from '@/lib/generatePrompt';

describe('generatePrompt', () => {
  it('should generate a Veo 3 prompt', () => {
    const data = { idea: 'a cat playing with a ball of yarn', model: 'veo3' as const };
    const result = generatePrompt(data);
    expect(result.assembledPrompt).toContain('a cat playing with a ball of yarn');
    expect(result.assembledPrompt).toContain('cinematography');
    expect(result.assembledPrompt).toContain('8-second cinematic shot');
    expect(result.assembledPrompt).toContain('realistic physics');
    expect(result.assembledPrompt).toContain('character consistency');
    expect(result.assembledPrompt).toContain('No subtitles, no text overlay');
    expect(result.assembledPrompt).toContain('dolly in');
    expect(result.assembledPrompt).toContain('cinematic');
  });

  it('should generate a Flow prompt', () => {
    const data = { idea: 'a dog chasing its tail', model: 'flow' as const };
    const result = generatePrompt(data);
    expect(result.assembledPrompt).toContain('a dog chasing its tail');
    expect(result.assembledPrompt).toContain('Professional cinematic filmmaking');
    expect(result.assembledPrompt).toContain('ingredients-based composition');
    expect(result.assembledPrompt).toContain('modular elements');
    expect(result.assembledPrompt).toContain('cinematic language');
    expect(result.assembledPrompt).toContain('match cuts');
    expect(result.assembledPrompt).toContain('establishing shots');
    expect(result.assembledPrompt).toContain('8-second professional filmmaking quality');
    expect(result.assembledPrompt).toContain('advanced');
  });

  it('should generate a Runway prompt', () => {
    const data = { idea: 'a futuristic city', model: 'runway' as const };
    const result = generatePrompt(data);
    expect(result.assembledPrompt).toContain('a futuristic city');
    expect(result.assembledPrompt).toContain('High-quality cinematic video');
    expect(result.assembledPrompt).toContain('optimized for RunwayML generation');
    expect(result.assembledPrompt).toContain('style');
    expect(result.assembledPrompt).toContain('environment');
    expect(result.assembledPrompt).toContain('dolly in');
    expect(result.assembledPrompt).toContain('cinematic');
  });

  it('should generate a Pika prompt', () => {
    const data = { idea: 'a magical forest', model: 'pika' as const };
    const result = generatePrompt(data);
    expect(result.assembledPrompt).toContain('a magical forest');
    expect(result.assembledPrompt).toContain('Engaging visual effects');
    expect(result.assembledPrompt).toContain('optimized for Pika Labs');
    expect(result.assembledPrompt).toContain('creative');
    expect(result.assembledPrompt).toContain('motion');
    expect(result.assembledPrompt).toContain('dolly in');
    expect(result.assembledPrompt).toContain('cinematic');
  });
});