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
  key?: NodeKey;
}

export type SerializedVideoBlockNode = Spread<
  {
    src: string;
    provider?: VideoProvider;
    title?: string;
  },
  SerializedLexicalNode
>;

export class VideoBlockNode extends DecoratorNode<React.ReactElement> {
  __src: string;
  __provider?: VideoProvider;
  __title?: string;

  static getType(): string {
    return 'video-block';
  }

  static clone(node: VideoBlockNode): VideoBlockNode {
    return new VideoBlockNode(
      node.__src,
      node.__provider,
      node.__title,
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedVideoBlockNode): VideoBlockNode {
    const { src, provider, title } = serializedNode;
    const node = $createVideoBlockNode({
      src,
      provider,
      title,
    });
    return node;
  }

  exportJSON(): SerializedVideoBlockNode {
    return {
      src: this.__src,
      provider: this.__provider,
      title: this.__title,
      type: 'video-block',
      version: 1,
    };
  }

  constructor(
    src: string,
    provider?: VideoProvider,
    title?: string,
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__provider = provider;
    this.__title = title;
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

  decorate(): React.ReactElement {
    return (
      <VideoBlockComponent
        src={this.__src}
        provider={this.__provider}
        title={this.__title}
        nodeKey={this.getKey()}
      />
    );
  }
}

export function $createVideoBlockNode({
  src,
  provider,
  title,
  key,
}: VideoBlockPayload): VideoBlockNode {
  return new VideoBlockNode(src, provider, title, key);
}

export function $isVideoBlockNode(
  node: LexicalNode | null | undefined,
): node is VideoBlockNode {
  return node instanceof VideoBlockNode;
}
