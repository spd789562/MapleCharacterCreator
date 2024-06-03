import { Assets, Sprite } from 'pixi.js';

import type { AnimatableFrame } from '../AnimatablePart';
import type {
  AncherMap,
  AncherName,
  ItemInfo,
  RenderPieceInfo,
  Vec2,
} from './const/data';

import { CharacterLoader } from './loader';
import { defaultAncher } from './const/ancher';
import type { CharacterItem } from './item';

export class CharacterItemPiece implements AnimatableFrame {
  info: ItemInfo;
  url: string;
  group?: string;
  z: string;
  slot: string;
  origin: Vec2;
  map: AncherMap;
  delay: number;

  zIndex: number;

  item: CharacterItem;

  ancher: Vec2;
  baseAncherName: AncherName = 'navel';

  isAncherBuilt = false;
  isIndepened = false;

  position = { x: 0, y: 0 };

  constructor(info: ItemInfo, piece: RenderPieceInfo, item: CharacterItem) {
    this.info = info;
    this.url = piece.url || '';
    this.group = piece.group;
    this.z = piece.z;
    this.slot = piece.slot;
    this.origin = piece.origin;
    this.map = piece.map || defaultAncher;
    this.delay = piece.delay;
    this.ancher = defaultAncher.navel;
    this.item = item;
    this.zIndex =
      CharacterLoader.zmap?.findIndex((z) => z === this.z) ||
      CharacterLoader.zmap?.findIndex((z) => z === this.slotName) ||
      0;
    this.isIndepened = Object.keys(this.map).length === 1;
  }

  get slotName() {
    return this.slot === 'default' ? this.z : this.z || this.slot;
  }

  getTexture() {
    return Assets.get(this.url);
  }
  getRenderAble() {
    return new Sprite(this.getTexture());
  }

  getResource() {
    if (!this.url) {
      return null;
    }
    return {
      alias: this.url,
      src: CharacterLoader.getPieceUrl(this.url),
      loadParser: 'loadTextures',
      format: '.webp',
    };
  }

  setAncher(ancherName: AncherName, baseAncher: Vec2) {
    this.ancher = {
      x: baseAncher.x - this.map[ancherName].x,
      y: baseAncher.y - this.map[ancherName].y,
    };
    this.position = {
      x: -this.map[ancherName].x - (this.origin?.x || 0),
      y: -this.map[ancherName].y - (this.origin?.y || 0),
    };

    this.isAncherBuilt = true;
  }

  /** build ancher and `update` frameAncherMap if any new ancher */
  buildAncher(frameAncherMap: Map<AncherName, Vec2>) {
    const pieceAncherKeys = Object.keys(this.map) as AncherName[];

    /** corresponding ancher in this piece */
    const baseAncherName = pieceAncherKeys.find((ancher) =>
      frameAncherMap.get(ancher),
    );
    const baseAncher = baseAncherName && frameAncherMap.get(baseAncherName);
    // if baseAncher doesn't contain any related ancher of this pieces, skip for now
    if (!(baseAncherName && baseAncher)) {
      return;
    }

    this.baseAncherName = baseAncherName;

    this.setAncher(baseAncherName as AncherName, baseAncher);

    const notBuiltedAnchers = pieceAncherKeys.filter(
      (ancher) => ancher !== baseAncherName && !frameAncherMap.has(ancher),
    );
    // is this piece contains other ancher and not in the frameAncherMap, add them to map
    for (const otherAncher of notBuiltedAnchers) {
      const ancher = this.map[otherAncher];
      // the new ancher is base on current piece's ancher
      frameAncherMap.set(otherAncher, {
        x: this.ancher.x + ancher.x,
        y: this.ancher.y + ancher.y,
      });
    }
  }
}
