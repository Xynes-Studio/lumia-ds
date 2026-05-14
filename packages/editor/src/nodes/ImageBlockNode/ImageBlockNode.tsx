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

export type ImageBlockAlignment = 'left' | 'center' | 'right' | undefined;

export interface ImageBlockPayload {
  src: string;
  alt?: string;
  caption?: string;
  layout?: 'inline' | 'breakout' | 'fullWidth';
  width?: number;
  height?: number;
  key?: NodeKey;
  status?: 'uploading' | 'uploaded' | 'error';
  alignment?: ImageBlockAlignment;
  /**
   * Stable storage object ID (STORAGE-11).
   * When set, callers persist this in the editor body instead of `src`,
   * and resolve a fresh signed delivery URL at render time via
   * `EditorMediaConfig.resolveDownloadUrl(objectId)`. The `src` field
   * may still carry a transient blob: preview or a freshly resolved
   * signed URL during the editor session, but persistence layers must
   * not store it when `objectId` is present.
   */
  objectId?: string;
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
    alignment?: ImageBlockAlignment;
    /** Stable storage object ID (STORAGE-11). See ImageBlockPayload. */
    objectId?: string;
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
  __alignment?: ImageBlockAlignment;
  __objectId?: string;

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
      node.__alignment,
      node.__key,
      node.__objectId,
    );
  }

  static importJSON(serializedNode: SerializedImageBlockNode): ImageBlockNode {
    const {
      src,
      alt,
      caption,
      layout,
      width,
      height,
      status,
      alignment,
      objectId,
    } = serializedNode;
    const node = $createImageBlockNode({
      src,
      alt,
      caption,
      layout,
      width,
      height,
      status,
      alignment,
      objectId,
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
      alignment: this.__alignment,
      objectId: this.__objectId,
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
    alignment?: ImageBlockAlignment,
    key?: NodeKey,
    objectId?: string,
  ) {
    super(key);
    this.__src = src;
    this.__alt = alt;
    this.__caption = caption;
    this.__layout = layout;
    this.__width = width;
    this.__height = height;
    this.__status = status;
    this.__alignment = alignment;
    this.__objectId = objectId;
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
      <ImageBlockComponent
        src={this.__src}
        alt={this.__alt}
        width={this.__width}
        height={this.__height}
        layout={this.__layout}
        caption={this.__caption}
        status={this.__status}
        alignment={this.__alignment}
        objectId={this.__objectId}
        nodeKey={this.getKey()}
      />
    );
  }

  setAlt(alt: string): void {
    const self = this.getWritable();
    self.__alt = alt;
  }

  setWidth(width: number): void {
    const self = this.getWritable();
    self.__width = width;
  }

  setHeight(height: number): void {
    const self = this.getWritable();
    self.__height = height;
  }

  setLayout(layout: 'inline' | 'breakout' | 'fullWidth'): void {
    const self = this.getWritable();
    self.__layout = layout;
  }

  setCaption(caption: string): void {
    const self = this.getWritable();
    self.__caption = caption;
  }

  setAlignment(alignment: ImageBlockAlignment): void {
    const self = this.getWritable();
    self.__alignment = alignment;
  }

  /**
   * Get the stable storage object ID for this image, if any (STORAGE-11).
   * Returns undefined for images that were not uploaded via the storage-service
   * adapter (e.g. legacy entries, images inserted from URL).
   */
  getObjectId(): string | undefined {
    // Read from the latest writable state to honour any in-flight updates.
    return this.__objectId;
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
  alignment,
  key,
  objectId,
}: ImageBlockPayload): ImageBlockNode {
  return new ImageBlockNode(
    src,
    alt,
    caption,
    layout,
    width,
    height,
    status,
    alignment,
    key,
    objectId,
  );
}

export function $isImageBlockNode(
  node: LexicalNode | null | undefined,
): node is ImageBlockNode {
  return node instanceof ImageBlockNode;
}
