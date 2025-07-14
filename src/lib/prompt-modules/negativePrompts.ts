
// src/lib/prompt-modules/negativePrompts.ts

export function getNegativePrompts(negatives?: string): string {
  return negatives || 'blurry, low-quality, cartoonish';
}
