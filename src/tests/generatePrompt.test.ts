
// /src/tests/generatePrompt.test.ts

import { generatePrompt } from '@/lib/generatePrompt';

describe('generatePrompt', () => {
  it('should generate a Veo 3 prompt', () => {
    const data = { idea: 'a cat playing with a ball of yarn', model: 'veo3' as const };
    const result = generatePrompt(data);
    expect(result.assembledPrompt).toContain('Scene: A high-quality, cinematic shot of a cat playing with a ball of yarn.');
  });

  it('should generate a Flow prompt', () => {
    const data = { idea: 'a dog chasing its tail', model: 'flow' as const };
    const result = generatePrompt(data);
    expect(result.assembledPrompt).toContain('Act as a professional cinematographer.');
    expect(result.assembledPrompt).toContain('Create a video about a dog chasing its tail.');
  });
});
