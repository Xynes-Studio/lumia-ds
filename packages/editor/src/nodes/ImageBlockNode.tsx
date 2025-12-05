import {
  DecoratorNode,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import * as React from 'react';

export interface ImageBlockPayload {
  src: string;
  alt?: string;
  caption?: string;
  layout?: 'inline' | 'breakout' | 'fullWidth';
  width?: number;
  height?: number;
  key?: NodeKey;
}

export type SerializedImageBlockNode = Spread<
  {
    src: string;
    alt?: string;
    caption?: string;
    layout?: 'inline' | 'breakout' | 'fullWidth';
    width?: number;
    height?: number;
  },
  SerializedLexicalNode
>;

export class ImageBlockNode extends DecoratorNode<React.ReactElement> {
  __src: string;
  __alt?: string;
  __caption?: string;
  __layout?: 'inline' | 'breakout' | 'fullWidth';
  __width?: number;
  __height?: number;

  static getType(): string {
    return 'image-block';
  }

  static clone(node: ImageBlockNode): ImageBlockNode {
    return new ImageBlockNode(
      node.__src,
      node.__alt,
      node.__caption,
      node.__layout,
      node.__width,
      node.__height,
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedImageBlockNode): ImageBlockNode {
    const { src, alt, caption, layout, width, height } = serializedNode;
    const node = $createImageBlockNode({
      src,
      alt,
      caption,
      layout,
      width,
      height,
    });
    return node;
  }

  exportJSON(): SerializedImageBlockNode {
    return {
      src: this.__src,
      alt: this.__alt,
      caption: this.__caption,
      layout: this.__layout,
      width: this.__width,
      height: this.__height,
      type: 'image-block',
      version: 1,
    };
  }

  constructor(
    src: string,
    alt?: string,
    caption?: string,
    layout?: 'inline' | 'breakout' | 'fullWidth',
    width?: number,
    height?: number,
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__alt = alt;
    this.__caption = caption;
    this.__layout = layout;
    this.__width = width;
    this.__height = height;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    const theme = config.theme;
    const className = theme.image;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): React.ReactElement {
    return (
      <img
        src={this.__src}
        alt={this.__alt}
        width={this.__width}
        height={this.__height}
        style={{
          maxWidth: '100%',
          display: this.__layout === 'inline' ? 'inline-block' : 'block',
        }}
      />
    );
  }
}

export function $createImageBlockNode({
  src,
  alt,
  caption,
  layout,
  width,
  height,
  key,
}: ImageBlockPayload): ImageBlockNode {
  return new ImageBlockNode(src, alt, caption, layout, width, height, key);
}

export function $isImageBlockNode(
  node: LexicalNode | null | undefined,
): node is ImageBlockNode {
  return node instanceof ImageBlockNode;
}
