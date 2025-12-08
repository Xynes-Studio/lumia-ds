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
  key?: NodeKey;
}

export type SerializedVideoBlockNode = Spread<
  {
    src: string;
    provider?: VideoProvider;
    title?: string;
    status?: 'uploading' | 'uploaded' | 'error';
  },
  SerializedLexicalNode
>;

export class VideoBlockNode extends DecoratorNode<React.ReactElement> {
  __src: string;
  __provider?: VideoProvider;
  __title?: string;
  __status?: 'uploading' | 'uploaded' | 'error';

  static getType(): string {
    return 'video-block';
  }

  static clone(node: VideoBlockNode): VideoBlockNode {
    return new VideoBlockNode(
      node.__src,
      node.__provider,
      node.__title,
      node.__status,
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedVideoBlockNode): VideoBlockNode {
    const { src, provider, title, status } = serializedNode;
    const node = $createVideoBlockNode({
      src,
      provider,
      title,
      status,
    });
    return node;
  }

  exportJSON(): SerializedVideoBlockNode {
    return {
      src: this.__src,
      provider: this.__provider,
      title: this.__title,
      status: this.__status,
      type: 'video-block',
      version: 1,
    };
  }

  constructor(
    src: string,
    provider?: VideoProvider,
    title?: string,
    status?: 'uploading' | 'uploaded' | 'error',
    key?: NodeKey,
  ) {
    super(key);

    this.__src = src;
    this.__provider = provider;
    this.__title = title;
    this.__status = status;
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
}

export function $createVideoBlockNode({
  src,
  provider,
  title,
  status,
  key,
}: VideoBlockPayload): VideoBlockNode {
  return new VideoBlockNode(src, provider, title, status, key);
}

export function $isVideoBlockNode(
  node: LexicalNode | null | undefined,
): node is VideoBlockNode {
  return node instanceof VideoBlockNode;
}
