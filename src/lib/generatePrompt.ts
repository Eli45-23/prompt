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

export interface GeneratedPrompt {
  rawTemplate: string;
  assembledPrompt: string;
}

const veo3Template = `
{idea}. {visual_style} cinematography with {camera_movement}. {background} with {lighting_mood}. {audio_cues}. {color_palette}. Professional 8-second cinematic shot with realistic physics and character consistency. No subtitles, no text overlay. {negative_prompts}.
`;

const flowTemplate = `
Professional cinematic filmmaking: {idea}. {visual_style} aesthetic with advanced {camera_movement}. {background} setting with {lighting_mood}. {audio_cues}. {color_palette}. Use ingredients-based composition with modular elements. Focus on cinematic language: match cuts, establishing shots, and sophisticated camera work. 8-second professional filmmaking quality. Avoid: {negative_prompts}.
`;

const runwayTemplate = `
{idea}. {visual_style} style with {camera_movement}. {background} environment, {lighting_mood}. {audio_cues}. {color_palette}. High-quality cinematic video optimized for RunwayML generation. Avoid: {negative_prompts}.
`;

const pikaTemplate = `
{idea}. {visual_style} with creative {camera_movement}. {background}, {lighting_mood}. {audio_cues}. {color_palette}. Engaging visual effects and motion optimized for Pika Labs. Avoid: {negative_prompts}.
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