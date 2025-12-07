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

export type StatusColor = 'success' | 'warning' | 'error' | 'info';

export interface StatusPayload {
    text: string;
    color: StatusColor;
    key?: NodeKey;
}

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
        return 'status';
    }

    static clone(node: StatusNode): StatusNode {
        return new StatusNode(node.__text, node.__color, node.__key);
    }

    static importJSON(serializedNode: SerializedStatusNode): StatusNode {
        const { text, color } = serializedNode;
        const node = $createStatusNode({ text, color });
        return node;
    }

    exportJSON(): SerializedStatusNode {
        return {
            text: this.__text,
            color: this.__color,
            type: 'status',
            version: 1,
        };
    }

    constructor(text: string, color: StatusColor, key?: NodeKey) {
        super(key);
        this.__text = text;
        this.__color = color;
    }

    getText(): string {
        return this.__text;
    }

    getColor(): StatusColor {
        return this.__color;
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

    isInline(): boolean {
        return true;
    }

    decorate(): React.ReactElement {
        return <StatusNodeComponent text={this.__text} color={this.__color} />;
    }
}

export function $createStatusNode({
    text,
    color,
    key,
}: StatusPayload): StatusNode {
    return new StatusNode(text, color, key);
}

export function $isStatusNode(
    node: LexicalNode | null | undefined,
): node is StatusNode {
    return node instanceof StatusNode;
}
