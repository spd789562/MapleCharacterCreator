import { Container, Assets, Sprite } from 'pixi.js';

import type { CharacterItem } from './item';

import { replaceIdInPath } from '@/utils/itemId';

import { CharacterLoader } from './loader';

/** a special sprite contain to sprite for dyablePiece  */
export class DyeableSprite extends Container {
  item: CharacterItem;
  mainUrl: string;

  _mainSprite: Container | null = null;
  _dyeSprite: Container | null = null;

  _failedToGetDye = false;

  constructor(item: CharacterItem, mainUrl: string) {
    super();
    this.item = item;
    this.mainUrl = mainUrl;
    this._mainSprite = Sprite.from(mainUrl);
    this.addChild(this._mainSprite);
    this.updateDye();
  }
  async updateDye() {
    this._failedToGetDye = false;
    await this.loadDyeAssets();
    this._dyeSprite && this.removeChild(this._dyeSprite);
    const dyePath = this.dyePath;
    /* if dye piece load faild then just render mainSprite */
    if (
      !(dyePath && this.item.info.dye) ||
      this._failedToGetDye ||
      this.item.info.dye.alpha === 0
    ) {
      return;
    }
    this._dyeSprite = Sprite.from(dyePath);
    this.addChild(this._dyeSprite);
    const dyeAlpha = this.item.info.dye.alpha;

    if (this._dyeSprite) {
      this._dyeSprite.alpha = dyeAlpha / 100;
    }
  }
  get dyeId() {
    if (this.item.info.dye === undefined) {
      return undefined;
    }
    return this.item.avaliableDye.get(this.item.info.dye.color);
  }
  get dyePath() {
    if (!this.dyeId) {
      return undefined;
    }
    if (this.mainUrl.includes(this.item.info.id.toString())) {
      return replaceIdInPath(this.mainUrl, this.dyeId);
    }
    return this.mainUrl;
  }
  async loadDyeAssets() {
    if (!this.item.info.dye) {
      return;
    }
    const dyeId = this.item.avaliableDye.get(this.item.info.dye?.color);
    if (!dyeId) {
      return;
    }
    const dyeUrl = replaceIdInPath(this.mainUrl, dyeId);
    try {
      await Assets.load({
        alias: dyeUrl,
        src: CharacterLoader.getPieceUrl(dyeUrl),
        loadParser: 'loadTextures',
        format: '.webp',
      });
    } catch (e) {
      this._failedToGetDye = true;
    }
  }
}
