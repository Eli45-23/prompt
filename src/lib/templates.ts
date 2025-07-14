
// src/lib/templates.ts

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  idea: string;
  model: 'veo3' | 'flow' | 'runway' | 'pika';
  visualStyle: string;
  cameraMovement: string;
  background: string;
  lightingMood: string;
  audioCues: string;
  colorPalette: string;
  negativePrompts: string;
}

export const predefinedTemplates: PromptTemplate[] = [
  {
    id: 'cinematic-veo3',
    name: 'Cinematic Veo 3 Intro',
    description: 'A dramatic, high-quality intro for Veo 3.',
    idea: 'a lone figure walking through a neon-lit city at night',
    model: 'veo3',
    visualStyle: 'cinematic, moody, 8k',
    cameraMovement: 'slow dolly in, then tracking shot',
    background: 'rain-slicked streets, towering skyscrapers',
    lightingMood: 'low-key, neon glow, atmospheric',
    audioCues: 'subtle synth music, distant city hum, footsteps',
    colorPalette: 'dark blues, purples, and vibrant neon accents',
    negativePrompts: 'blurry, cartoon, low resolution, daytime',
  },
  {
    id: 'flow-documentary',
    name: 'Flow Documentary Style',
    description: 'A clear, informative prompt for Flow in a documentary style.',
    idea: 'a close-up of a bee pollinating a flower',
    model: 'flow',
    visualStyle: 'realistic, natural, macro',
    cameraMovement: 'static shot, then slow pan',
    background: 'lush garden, blurred foliage',
    lightingMood: 'natural sunlight, soft, bright',
    audioCues: 'gentle buzzing, ambient nature sounds',
    colorPalette: 'vibrant greens, yellows, and browns',
    negativePrompts: 'blurry, artificial, cartoon, dark',
  },
  {
    id: 'runway-abstract',
    name: 'Runway Abstract Art',
    description: 'An abstract and surreal prompt for RunwayML.',
    idea: 'liquid metal flowing over geometric shapes',
    model: 'runway',
    visualStyle: 'abstract, surreal, fluid dynamics',
    cameraMovement: 'orbiting, slow zoom out',
    background: 'dark void, subtle light sources',
    lightingMood: 'iridescent, glowing, ethereal',
    audioCues: 'ambient, evolving soundscapes',
    colorPalette: 'shifting metallics, deep purples, electric blues',
    negativePrompts: 'realistic, mundane, static, sharp edges',
  },
];
