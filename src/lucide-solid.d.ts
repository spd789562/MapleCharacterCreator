declare module 'lucide-solid/icons/*' {
  import type { LucideProps } from 'lucide-solid';
  import type { Component } from 'solid-js';
  const cmp: Component<LucideProps>;

  export = cmp;
}

declare module 'dom-to-image-more' {
  import domToImage = require('dom-to-image');
  export = domToImage;
}

/// <reference path="./renderer/filter/anime4k/Anime4kSyetem.d.ts" />
