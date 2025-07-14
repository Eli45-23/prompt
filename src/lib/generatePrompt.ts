
// /lib/generatePrompt.ts

// This file contains the core logic for generating optimized video prompts
// for Google's Veo 3 and Flow models.

// To update the prompt templates, modify the `veo3Template` and `flowTemplate`
// strings below. The templates are designed to be easily extensible.
// When new features or best practices are introduced, you can add new
// sections to the templates.

// For example, if a new parameter for controlling the "emotional tone" is
// added, you could add a new line to the templates like:
// Emotional Tone: {emotional_tone}

// The `generatePrompt` function takes a user's idea and a target model
// and returns a fully fleshed-out prompt.

interface PromptData {
  idea: string;
  model: 'veo3' | 'flow';
}

interface GeneratedPrompt {
  rawTemplate: string;
  assembledPrompt: string;
}

const veo3Template = `
Scene: A high-quality, cinematic shot of {idea}.
Visual Style: {visual_style}, 8k, sharp focus, high contrast.
Camera Movement: {camera_movement}.
Main Subject: A detailed view of {idea}.
Background: {background}.
Lighting and Mood: {lighting_mood}.
Audio Cues: {audio_cues}.
Color Palette: {color_palette}.
Negative Prompts: {negative_prompts}.
`;

const flowTemplate = `
Act as a professional cinematographer.
Create a video about {idea}.
The video should have a {visual_style} feel.
Use a {camera_movement} to capture the action.
The main subject is {idea}.
The background should be {background}.
The lighting should be {lighting_mood}.
The audio should consist of {audio_cues}.
The color palette should be {color_palette}.
Avoid the following: {negative_prompts}.
`;

// This is a placeholder for a more sophisticated logic that could
// be used to generate the different parts of the prompt.
// For now, we will use some default values.
const promptFragments = {
  visual_style: 'cinematic',
  camera_movement: 'slow dolly in',
  background: 'a neutral, out-of-focus background',
  lighting_mood: 'dramatic, with a single key light',
  audio_cues: 'a subtle, ambient soundtrack',
  color_palette: 'a muted, desaturated color palette',
  negative_prompts: 'blurry, low-quality, cartoonish',
};

export function generatePrompt(data: PromptData): GeneratedPrompt {
  const { idea, model } = data;
  const template = model === 'veo3' ? veo3Template : flowTemplate;

  const assembledPrompt = template
    .replace(/{idea}/g, idea)
    .replace(/{visual_style}/g, promptFragments.visual_style)
    .replace(/{camera_movement}/g, promptFragments.camera_movement)
    .replace(/{background}/g, promptFragments.background)
    .replace(/{lighting_mood}/g, promptFragments.lighting_mood)
    .replace(/{audio_cues}/g, promptFragments.audio_cues)
    .replace(/{color_palette}/g, promptFragments.color_palette)
    .replace(/{negative_prompts}/g, promptFragments.negative_prompts);

  return {
    rawTemplate: template,
    assembledPrompt,
  };
}
