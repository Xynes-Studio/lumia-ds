import * as React from 'react';
import type { NodeKey } from 'lexical';
import type { StatusColor } from './StatusNode';
import { StatusNodePopover } from './StatusNodePopover';

export interface StatusNodeComponentProps {
    text: string;
    color: StatusColor;
    nodeKey: NodeKey;
}

/**
 * StatusNodeComponent - React component rendered by StatusNode decorator.
 *
 * Wraps the status pill with a popover for inline editing of text and color.
 */
export function StatusNodeComponent({
    text,
    color,
    nodeKey,
}: StatusNodeComponentProps): React.ReactElement {
    return (
        <StatusNodePopover
            nodeKey={nodeKey}
            text={text}
            color={color}
        />
    );
}
