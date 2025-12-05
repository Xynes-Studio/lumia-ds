import {
  DecoratorNode,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import * as React from 'react';
import { ImageBlockComponent } from './ImageBlockComponent';

export interface ImageBlockPayload {
  src: string;
  alt?: string;
  caption?: string;
  layout?: 'inline' | 'breakout' | 'fullWidth';
  width?: number;
  height?: number;
  key?: NodeKey;
  status?: 'uploading' | 'uploaded' | 'error';
}

export type SerializedImageBlockNode = Spread<
  {
    src: string;
    alt?: string;
    caption?: string;
    layout?: 'inline' | 'breakout' | 'fullWidth';
    width?: number;
    height?: number;
    status?: 'uploading' | 'uploaded' | 'error';
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
  __status?: 'uploading' | 'uploaded' | 'error';

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
      node.__status,
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedImageBlockNode): ImageBlockNode {
    const { src, alt, caption, layout, width, height, status } = serializedNode;
    const node = $createImageBlockNode({
      src,
      alt,
      caption,
      layout,
      width,
      height,
      status,
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
      status: this.__status,
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
    status?: 'uploading' | 'uploaded' | 'error',
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__alt = alt;
    this.__caption = caption;
    this.__layout = layout;
    this.__width = width;
    this.__height = height;
    this.__status = status;
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
    console.log('ImageBlockNode decorate', {
      src: this.__src,
      status: this.__status,
    });
    return (
      <ImageBlockComponent
        src={this.__src}
        alt={this.__alt}
        width={this.__width}
        height={this.__height}
        caption={this.__caption}
        status={this.__status}
        nodeKey={this.getKey()}
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
  status,
  key,
}: ImageBlockPayload): ImageBlockNode {
  return new ImageBlockNode(
    src,
    alt,
    caption,
    layout,
    width,
    height,
    status,
    key,
  );
}

export function $isImageBlockNode(
  node: LexicalNode | null | undefined,
): node is ImageBlockNode {
  return node instanceof ImageBlockNode;
}
