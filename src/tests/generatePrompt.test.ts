// /src/tests/generatePrompt.test.ts

import { generatePrompt } from '@/lib/generatePrompt';

describe('generatePrompt', () => {
  it('should generate a Veo 3 prompt', () => {
    const data = { idea: 'a cat playing with a ball of yarn', model: 'veo3' as const };
    const result = generatePrompt(data);
    expect(result.assembledPrompt).toContain('Scene: A high-quality, cinematic shot of a cat playing with a ball of yarn.');
    expect(result.assembledPrompt).toContain('Visual Style:');
    expect(result.assembledPrompt).toContain('Camera Movement:');
    expect(result.assembledPrompt).toContain('Main Subject:');
    expect(result.assembledPrompt).toContain('Background:');
    expect(result.assembledPrompt).toContain('Lighting and Mood:');
    expect(result.assembledPrompt).toContain('Audio Cues:');
    expect(result.assembledPrompt).toContain('Color Palette:');
    expect(result.assembledPrompt).toContain('Negative Prompts:');
  });

  it('should generate a Flow prompt', () => {
    const data = { idea: 'a dog chasing its tail', model: 'flow' as const };
    const result = generatePrompt(data);
    expect(result.assembledPrompt).toContain('Act as a professional cinematographer.');
    expect(result.assembledPrompt).toContain('Create a video about a dog chasing its tail.');
    expect(result.assembledPrompt).toContain('The video should have a cinematic feel.');
    expect(result.assembledPrompt).toContain('Use a slow dolly in to capture the action.');
    expect(result.assembledPrompt).toContain('The main subject is a dog chasing its tail.');
    expect(result.assembledPrompt).toContain('The background should be a neutral, out-of-focus background.');
    expect(result.assembledPrompt).toContain('The lighting should be dramatic, with a single key light.');
    expect(result.assembledPrompt).toContain('The audio should consist of a subtle, ambient soundtrack.');
    expect(result.assembledPrompt).toContain('The color palette should be a muted, desaturated color palette.');
    expect(result.assembledPrompt).toContain('Avoid the following: blurry, low-quality, cartoonish.');
  });

  it('should generate a Runway prompt', () => {
    const data = { idea: 'a futuristic city', model: 'runway' as const };
    const result = generatePrompt(data);
    expect(result.assembledPrompt).toContain('Generate a video using RunwayML.');
    expect(result.assembledPrompt).toContain('Concept: a futuristic city.');
    expect(result.assembledPrompt).toContain('Style:');
    expect(result.assembledPrompt).toContain('Camera:');
    expect(result.assembledPrompt).toContain('Environment:');
    expect(result.assembledPrompt).toContain('Atmosphere:');
    expect(result.assembledPrompt).toContain('Sound:');
    expect(result.assembledPrompt).toContain('Colors:');
    expect(result.assembledPrompt).toContain('Exclude:');
  });

  it('should generate a Pika prompt', () => {
    const data = { idea: 'a magical forest', model: 'pika' as const };
    const result = generatePrompt(data);
    expect(result.assembledPrompt).toContain('Create a video with Pika Labs.');
    expect(result.assembledPrompt).toContain('Subject: a magical forest.');
    expect(result.assembledPrompt).toContain('Visuals:');
    expect(result.assembledPrompt).toContain('Motion:');
    expect(result.assembledPrompt).toContain('Setting:');
    expect(result.assembledPrompt).toContain('Illumination:');
    expect(result.assembledPrompt).toContain('Audio:');
    expect(result.assembledPrompt).toContain('Color Scheme:');
    expect(result.assembledPrompt).toContain('Undesired:');
  });
});