import {
  DecoratorNode,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import * as React from 'react';
import { StatusNodeComponent } from './StatusNodeComponent';
import { StatusColor, StatusNodePayload } from './types';

export type SerializedStatusNode = Spread<
  {
    text: string;
    color: StatusColor;
  },
  SerializedLexicalNode
>;

export class StatusNode extends DecoratorNode<React.ReactElement> {
  __text: string;
  __color: StatusColor;

  static getType(): string {
    return 'status-node';
  }

  static clone(node: StatusNode): StatusNode {
    return new StatusNode(node.__text, node.__color, node.__key);
  }

  static importJSON(serializedNode: SerializedStatusNode): StatusNode {
    const { text, color } = serializedNode;
    return $createStatusNode({
      text,
      color,
    });
  }

  exportJSON(): SerializedStatusNode {
    return {
      text: this.__text,
      color: this.__color,
      type: 'status-node',
      version: 1,
    };
  }

  constructor(text: string, color: StatusColor, key?: NodeKey) {
    super(key);
    this.__text = text;
    this.__color = color;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    const theme = config.theme;
    const className = theme.status;
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
      <StatusNodeComponent
        text={this.__text}
        color={this.__color}
        nodeKey={this.getKey()}
      />
    );
  }

  isInline(): boolean {
    return true;
  }
}

export function $createStatusNode({
  text,
  color,
  key,
}: StatusNodePayload): StatusNode {
  return new StatusNode(text, color, key);
}

export function $isStatusNode(
  node: LexicalNode | null | undefined,
): node is StatusNode {
  return node instanceof StatusNode;
}
