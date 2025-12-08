import {
  DecoratorNode,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import * as React from 'react';
import { VideoBlockComponent } from './VideoBlockComponent';

export type VideoProvider = 'youtube' | 'vimeo' | 'loom' | 'html5';

export interface VideoBlockPayload {
  src: string;
  provider?: VideoProvider;
  title?: string;
  status?: 'uploading' | 'uploaded' | 'error';
  width?: number;
  height?: number;
  layout?: 'inline' | 'breakout' | 'fullWidth';
  alignment?: VideoBlockAlignment;
  key?: NodeKey;
}

export type SerializedVideoBlockNode = Spread<
  {
    src: string;
    provider?: VideoProvider;
    title?: string;
    status?: 'uploading' | 'uploaded' | 'error';
    width?: number;
    height?: number;
    layout?: 'inline' | 'breakout' | 'fullWidth';
    alignment?: VideoBlockAlignment;
  },
  SerializedLexicalNode
>;

export type VideoBlockAlignment = 'left' | 'center' | 'right' | undefined;

export class VideoBlockNode extends DecoratorNode<React.ReactElement> {
  __src: string;
  __provider?: VideoProvider;
  __title?: string;
  __status?: 'uploading' | 'uploaded' | 'error';
  __width?: number;
  __height?: number;
  __layout?: 'inline' | 'breakout' | 'fullWidth';
  __alignment?: VideoBlockAlignment;

  static getType(): string {
    return 'video-block';
  }

  static clone(node: VideoBlockNode): VideoBlockNode {
    return new VideoBlockNode(
      node.__src,
      node.__provider,
      node.__title,
      node.__status,
      node.__width,
      node.__height,
      node.__layout,
      node.__alignment,
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedVideoBlockNode): VideoBlockNode {
    const { src, provider, title, status, width, height, layout, alignment } =
      serializedNode;
    const node = $createVideoBlockNode({
      src,
      provider,
      title,
      status,
      width,
      height,
      layout,
      alignment,
    });
    return node;
  }

  exportJSON(): SerializedVideoBlockNode {
    return {
      src: this.__src,
      provider: this.__provider,
      title: this.__title,
      status: this.__status,
      width: this.__width,
      height: this.__height,
      layout: this.__layout,
      alignment: this.__alignment,
      type: 'video-block',
      version: 1,
    };
  }

  constructor(
    src: string,
    provider?: VideoProvider,
    title?: string,
    status?: 'uploading' | 'uploaded' | 'error',
    width?: number,
    height?: number,
    layout?: 'inline' | 'breakout' | 'fullWidth',
    alignment?: VideoBlockAlignment,
    key?: NodeKey,
  ) {
    super(key);

    this.__src = src;
    this.__provider = provider;
    this.__title = title;
    this.__status = status;
    this.__width = width;
    this.__height = height;
    this.__layout = layout;
    this.__alignment = alignment;
  }

  getSrc(): string {
    return this.__src;
  }

  getProvider(): VideoProvider | undefined {
    return this.__provider;
  }

  getTitle(): string | undefined {
    return this.__title;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    const theme = config.theme;
    const className = theme.video;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  decorate(): React.ReactElement {
    return (
      <VideoBlockComponent
        src={this.__src}
        provider={this.__provider}
        title={this.__title}
        status={this.__status}
        width={this.__width}
        height={this.__height}
        layout={this.__layout}
        alignment={this.__alignment}
        nodeKey={this.getKey()}
      />
    );
  }

  getStatus(): 'uploading' | 'uploaded' | 'error' | undefined {
    return this.__status;
  }

  setStatus(status: 'uploading' | 'uploaded' | 'error'): void {
    const self = this.getWritable();
    self.__status = status;
  }

  setSrc(src: string): void {
    const self = this.getWritable();
    self.__src = src;
  }

  setProvider(provider: VideoProvider): void {
    const self = this.getWritable();
    self.__provider = provider;
  }

  setTitle(title: string): void {
    const self = this.getWritable();
    self.__title = title;
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

  setAlignment(alignment: VideoBlockAlignment): void {
    const self = this.getWritable();
    self.__alignment = alignment;
  }
}

export function $createVideoBlockNode({
  src,
  provider,
  title,
  status,
  width,
  height,
  layout,
  alignment,
  key,
}: VideoBlockPayload): VideoBlockNode {
  return new VideoBlockNode(
    src,
    provider,
    title,
    status,
    width,
    height,
    layout,
    alignment,
    key,
  );
}

export function $isVideoBlockNode(
  node: LexicalNode | null | undefined,
): node is VideoBlockNode {
  return node instanceof VideoBlockNode;
}
