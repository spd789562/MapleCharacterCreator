import { Container, Ticker } from 'pixi.js';

import type { ItemInfo, AncherName, Vec2, PieceSlot } from './const/data';
import type { CategorizedItem } from './categorizedItem';
import type { AnimatablePart } from '../AnimatablePart';
import type { CharacterItemPiece } from './itemPiece';

import { CharacterLoader } from './loader';
import { CharacterItem } from './item';
import { CharacterAction, isBackAction } from './const/actions';
import { CharacterExpressions } from './const/emotions';
import { CharacterEarType } from './const/ears';
import { CharacterHandType } from './const/hand';
import type { PieceIslot } from './const/slot';

type AnyCategorizedItem = CategorizedItem<string>;

class ZmapContainer extends Container {
  name: PieceSlot;
  _onlyDisplayId: number;
  constructor(name: PieceSlot, index: number) {
    super();
    this.name = name;
    this.zIndex = index;
    this._onlyDisplayId = 0;
  }
  addCharacterPart(child: AnimatablePart) {
    super.addChild(child);
    this.refreshLock();
  }
  get onlyDisplayId() {
    return this._onlyDisplayId;
  }
  set onlyDisplayId(id: number) {
    this._onlyDisplayId = id;
    this.refreshLock();
  }
  refreshLock() {
    for (const child of this.children) {
      const frame = (child as AnimatablePart).frames[0] as CharacterItemPiece;
      if (!this.onlyDisplayId || frame.info.id === this.onlyDisplayId) {
        child.visible = true;
      } else {
        child.visible = false;
      }
    }
  }
}

export class Character extends Container {
  idItems = new Map<number, CharacterItem>();
  actionAnchers = new Map<CharacterAction, Map<AncherName, Vec2>[]>();

  #_action = CharacterAction.Walk1;
  #_expression: CharacterExpressions = CharacterExpressions.Default;
  #_earType = CharacterEarType.HumanEar;
  #_handType = CharacterHandType.SingleHand;

  zmapLayers = new Map<PieceSlot, ZmapContainer>();
  locks = new Map<PieceSlot, number>();

  frame = 0;
  /* delta to calculate is need enter next frame */
  currentDelta = 0;
  currentTicker?: (delta: Ticker) => void;

  constructor() {
    super();
    this.sortableChildren = true;
  }

  get action() {
    return this.#_action;
  }
  get expression() {
    return this.#_expression;
  }
  get earType() {
    return this.#_earType;
  }
  get handType() {
    return this.#_handType;
  }
  set action(action: CharacterAction) {
    this.#_action = action;

    const faceLayer = this.zmapLayers.get('face');
    if (faceLayer) {
      if (isBackAction(this.action)) {
        faceLayer.visible = false;
      } else {
        faceLayer.visible = true;
      }
    }

    this.render();
  }
  set expression(expression: CharacterExpressions) {
    this.#_expression = expression;
    this.render();
  }
  set earType(earType: CharacterEarType) {
    this.#_earType = earType;
    this.render();
  }
  set handType(handType: CharacterHandType) {
    this.#_handType = handType;
    if (this.action.includes('walk')) {
      if (handType === CharacterHandType.SingleHand) {
        this.action = CharacterAction.Walk1;
      } else {
        this.action = CharacterAction.Walk2;
      }
    }
    if (this.action.includes('stand')) {
      if (handType === CharacterHandType.SingleHand) {
        this.action = CharacterAction.Stand1;
      } else {
        this.action = CharacterAction.Stand2;
      }
    }

    this.render();
  }

  updateItems(items: ItemInfo[]) {
    for (const item of items) {
      const chItem = new CharacterItem(item, this);
      this.idItems.set(item.id, chItem);
    }
  }

  get currentAllItem() {
    return Array.from(this.idItems.values())
      .map((item) =>
        item.isFace
          ? item.actionPieces.get(this.expression)
          : item.actionPieces.get(this.action),
      )
      .filter((item) => item) as AnyCategorizedItem[];
  }

  render() {
    const zmap = CharacterLoader?.zmap;
    if (!zmap) {
      return;
    }
    this.reset();
    const pieces: AnimatablePart[] = [];
    let body: AnimatablePart | undefined = undefined;
    for (const layer of zmap) {
      for (const item of this.currentAllItem) {
        const piece = item.items.get(layer);
        if (piece) {
          let container = this.zmapLayers.get(layer);
          if (!container) {
            container = new ZmapContainer(layer, zmap.indexOf(layer));
            if (isBackAction(this.action) && layer === 'face') {
              container.visible = false;
            }
            this.addChild(container);
            this.zmapLayers.set(layer, container);
            container.onlyDisplayId = this.locks.get(layer) || 0;
          }
          if (layer === 'body' || layer === 'backBody') {
            body = piece;
          }
          // not sure why need to do this while it already initialized in constructor
          piece.frameChanges(0);

          pieces.push(piece);

          // TEST: for testing single frame is working
          // const frame = piece.frames[0];
          // const texture = piece.frames[0]?.getTexture();
          // const sprite = new Sprite(texture);

          // sprite.position.set(
          //   frame.ancher.x - frame.position.x,
          //   frame.ancher.x - frame.position.y,
          // );
          // sprite.position.copyFrom(frame.position);

          // container.addChild(sprite);

          container.addChild(piece);
          break;
        }
      }
    }

    if (!body) {
      console.error('No body found');
      return;
    }

    this.playPieces(pieces);
    this.playByBody(body, pieces);
  }

  reset() {
    this.currentTicker && Ticker.shared.remove(this.currentTicker);
    this.clearnContainerChild();
  }
  clearnContainerChild() {
    for (const child of this.children) {
      child.removeChildren();
    }
  }

  playByBody(body: AnimatablePart, pieces: AnimatablePart[]) {
    const maxFrame = pieces.reduce((max, piece) => {
      return Math.max(max, piece.frames.length);
    }, 0);

    this.currentTicker = (delta) => {
      this.currentDelta += delta.deltaMS;
      if (this.currentDelta > body.getCurrentDelay()) {
        this.frame += 1;
        this.currentDelta = 0;
        if (this.frame >= maxFrame) {
          this.frame = 0;
        }
        this.playPieces(pieces);
      }
    };

    Ticker.shared.add(this.currentTicker);
  }
  playPieces(pieces: AnimatablePart[]) {
    const frame = this.frame;

    const currentAncher = this.actionAnchers.get(this.action)?.[frame];

    if (!currentAncher) {
      return;
    }
    for (const piece of pieces) {
      const pieceFrameIndex = piece.frames[frame] ? frame : 0;
      const pieceFrame = (piece.frames[frame] ||
        piece.frames[0]) as CharacterItemPiece;
      if (pieceFrame) {
        const ancherName = pieceFrame.baseAncherName;
        const ancher = currentAncher.get(ancherName);
        ancher && piece.parent?.position.copyFrom(ancher);
        piece.currentFrame = pieceFrameIndex;
      }
    }
  }

  get isAllAncherBuilt() {
    return Array.from(this.idItems.values()).every(
      (item) => item.isAllAncherBuilt,
    );
  }

  async loadItems() {
    for await (const item of this.idItems.values()) {
      await item.load();
    }
    const itemCount = this.idItems.size;
    // try to build ancher but up to 2 times of item count
    for (let i = 0; i < itemCount * 4; i++) {
      if (this.isAllAncherBuilt) {
        break;
      }
      this.buildAncher();
    }

    this.buildLock();
  }

  buildLock() {
    const orderedItems = CharacterLoader.zmap?.reduce((acc, layer) => {
      for (const item of this.idItems.values()) {
        if (item.islot.includes(layer as PieceIslot)) {
          acc.push(item);
        }
      }
      return acc;
    }, [] as CharacterItem[]);
    if (!orderedItems) {
      return;
    }
    for (const item of orderedItems) {
      for (const slot of item.vslot) {
        this.locks.set(slot, item.info.id);
      }
    }
  }

  buildAncher() {
    for (const action of Object.values(CharacterAction)) {
      for (const item of this.idItems.values()) {
        const ancher = this.actionAnchers.get(action);
        this.actionAnchers.set(
          action,
          item.tryBuildAncher(action, ancher || []),
        );
      }
    }
  }
}