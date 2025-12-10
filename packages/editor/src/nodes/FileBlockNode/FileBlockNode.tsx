import {
  DecoratorNode,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import * as React from 'react';
import { FileBlockComponent } from './FileBlockComponent';

export interface FileBlockPayload {
  url: string;
  filename: string;
  size?: number;
  mime?: string;
  status?: 'uploading' | 'uploaded' | 'error';
  key?: NodeKey;
}

export type SerializedFileBlockNode = Spread<
  {
    url: string;
    filename: string;
    size?: number;
    mime?: string;
    status?: 'uploading' | 'uploaded' | 'error';
  },
  SerializedLexicalNode
>;

export class FileBlockNode extends DecoratorNode<React.ReactElement> {
  __url: string;
  __filename: string;
  __size?: number;
  __mime?: string;
  __status?: 'uploading' | 'uploaded' | 'error';

  static getType(): string {
    return 'file-block';
  }

  static clone(node: FileBlockNode): FileBlockNode {
    return new FileBlockNode(
      node.__url,
      node.__filename,
      node.__size,
      node.__mime,
      node.__status,
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedFileBlockNode): FileBlockNode {
    const { url, filename, size, mime, status } = serializedNode;
    const node = $createFileBlockNode({
      url,
      filename,
      size,
      mime,
      status,
    });
    return node;
  }

  exportJSON(): SerializedFileBlockNode {
    return {
      url: this.__url,
      filename: this.__filename,
      size: this.__size,
      mime: this.__mime,
      status: this.__status,
      type: 'file-block',
      version: 1,
    };
  }

  constructor(
    url: string,
    filename: string,
    size?: number,
    mime?: string,
    status?: 'uploading' | 'uploaded' | 'error',
    key?: NodeKey,
  ) {
    super(key);
    this.__url = url;
    this.__filename = filename;
    this.__size = size;
    this.__mime = mime;
    this.__status = status;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    const theme = config.theme;
    const className = theme.file;
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
      <FileBlockComponent
        url={this.__url}
        filename={this.__filename}
        size={this.__size}
        mime={this.__mime}
        status={this.__status}
        nodeKey={this.getKey()}
      />
    );
  }
}

export function $createFileBlockNode({
  url,
  filename,
  size,
  mime,
  status,
  key,
}: FileBlockPayload): FileBlockNode {
  return new FileBlockNode(url, filename, size, mime, status, key);
}

export function $isFileBlockNode(
  node: LexicalNode | null | undefined,
): node is FileBlockNode {
  return node instanceof FileBlockNode;
}
