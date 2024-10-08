import { atom, map } from 'nanostores';
import { Application } from 'pixi.js';

import { CharacterLoader } from '@/renderer/character/loader';

export const $preferRenderer = atom<'webgl' | 'webgpu'>('webgpu');

export const $globalRenderer = atom<Application>(new Application());
export const $actionRenderer = atom<Application>(new Application());

export const $isGlobalRendererInitialized = atom<boolean>(false);
export const $isActionRendererInitialized = atom<boolean>(false);

export const $simpleCharacterCache = map<Record<string, string>>({});

export async function initialGlobalRenderer() {
  const app = $globalRenderer.get();
  await CharacterLoader.init();
  await app.init({
    width: 300,
    height: 340,
    backgroundAlpha: 0,
    preference: $preferRenderer.get(),
  });
  $isGlobalRendererInitialized.set(true);
}

export function clearCharacterCache() {
  const currentCache = $simpleCharacterCache.get();
  for (const key in currentCache) {
    URL.revokeObjectURL(currentCache[key]);
  }
  $simpleCharacterCache.set({});
}
