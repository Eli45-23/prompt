// /lib/generatePrompt.ts

import { getVisualStyle } from './prompt-modules/visualStyle';
import { getCameraMovement } from './prompt-modules/cameraMovement';
import { getBackground } from './prompt-modules/background';
import { getLightingMood } from './prompt-modules/lightingMood';
import { getAudioCues } from './prompt-modules/audioCues';
import { getColorPalette } from './prompt-modules/colorPalette';
import { getNegativePrompts } from './prompt-modules/negativePrompts';

// This file contains the core logic for generating optimized video prompts
// for Google's Veo 3 and Flow models, and other platforms like Runway and Pika.

// To update the prompt templates, modify the `veo3Template`, `flowTemplate`,
// `runwayTemplate`, and `pikaTemplate` strings below. The templates are designed
// to be easily extensible. When new features or best practices are introduced,
// you can add new sections to the templates.

// For example, if a new parameter for controlling the "emotional tone" is
// added, you could add a new line to the templates like:
// Emotional Tone: {emotional_tone}

// The `generatePrompt` function takes a user's idea and a target model
// and returns a fully fleshed-out prompt.

interface PromptData {
  idea: string;
  model: 'veo3' | 'flow' | 'runway' | 'pika';
  visualStyle?: string;
  cameraMovement?: string;
  background?: string;
  lightingMood?: string;
  audioCues?: string;
  colorPalette?: string;
  negativePrompts?: string;
}

interface GeneratedPrompt {
  rawTemplate: string;
  assembledPrompt: string;
}

const veo3Template = `
Scene: A high-quality, cinematic shot of {idea}.
Visual Style: {visual_style}.
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

const runwayTemplate = `
Generate a video using RunwayML.
Concept: {idea}.
Style: {visual_style}.
Camera: {camera_movement}.
Environment: {background}.
Atmosphere: {lighting_mood}.
Sound: {audio_cues}.
Colors: {color_palette}.
Exclude: {negative_prompts}.
`;

const pikaTemplate = `
Create a video with Pika Labs.
Subject: {idea}.
Visuals: {visual_style}.
Motion: {camera_movement}.
Setting: {background}.
Illumination: {lighting_mood}.
Audio: {audio_cues}.
Color Scheme: {color_palette}.
Undesired: {negative_prompts}.
`;

export function generatePrompt(data: PromptData): GeneratedPrompt {
  const { idea, model, ...customFragments } = data;
  let template: string;

  switch (model) {
    case 'veo3':
      template = veo3Template;
      break;
    case 'flow':
      template = flowTemplate;
      break;
    case 'runway':
      template = runwayTemplate;
      break;
    case 'pika':
      template = pikaTemplate;
      break;
    default:
      template = veo3Template; // Fallback
  }

  const assembledPrompt = template
    .replace(/{idea}/g, idea)
    .replace(/{visual_style}/g, getVisualStyle(customFragments.visualStyle))
    .replace(/{camera_movement}/g, getCameraMovement(customFragments.cameraMovement))
    .replace(/{background}/g, getBackground(customFragments.background))
    .replace(/{lighting_mood}/g, getLightingMood(customFragments.lightingMood))
    .replace(/{audio_cues}/g, getAudioCues(customFragments.audioCues))
    .replace(/{color_palette}/g, getColorPalette(customFragments.colorPalette))
    .replace(/{negative_prompts}/g, getNegativePrompts(customFragments.negativePrompts));

  return {
    rawTemplate: template,
    assembledPrompt,
  };
}