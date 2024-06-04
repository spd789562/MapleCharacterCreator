import { atom } from 'nanostores';

import type { ItemInfo } from '@/renderer/character/const/data';

export interface CharacterData {
  items: ItemInfo[];
  frame?: number;
  isAnimating: boolean;
}

export const $currentCharacter = atom<CharacterData>({
  items: [
    {
      id: 2000,
    },
    {
      id: 12000,
    },
    {
      id: 56772,
      dye: {
        color: 6,
        alpha: 50,
      },
    },
    {
      // hair
      id: 47046,
      dye: {
        color: 0,
        alpha: 50,
      },
    },
    {
      // hat half cover
      id: 1006105,
    },
    // {
    //   //  hat full cover
    //   id: 1000003,
    // },
    {
      // face accessory
      id: 1012764,
    },
    {
      // glass/eye accessory
      id: 1022285,
    },
    {
      // earring
      id: 1032331,
    },
    {
      // overall
      id: 1053576,
    },
    {
      // shoe
      id: 1073273,
    },
    {
      // cap
      id: 1103580,
      hue: 180,
      brightness: 0.1,
      saturation: 0.5,
    },
    {
      // weapon
      id: 1703339,
    },
  ],
  frame: 0,
  isAnimating: false,
});
