import * as React from 'react';
import { useCallback } from 'react';
import { LexicalEditor, $getNodeByKey, NodeKey } from 'lexical';
import { $isVideoBlockNode, VideoBlockNode } from './VideoBlockNode';
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Trash2,
    Expand,
    Minimize,
    LayoutTemplate,
} from 'lucide-react';
import type { VideoBlockAlignment } from './VideoBlockNode';

interface VideoFloatingToolbarProps {
    editor: LexicalEditor;
    nodeKey: NodeKey;
    layout?: 'inline' | 'breakout' | 'fullWidth';
    alignment?: VideoBlockAlignment;
}

export function VideoFloatingToolbar({
    editor,
    nodeKey,
    layout,
    alignment,
}: VideoFloatingToolbarProps): React.JSX.Element {
    const updateNode = useCallback(
        (updateFn: (node: VideoBlockNode) => void) => {
            editor.update(() => {
                const node = $getNodeByKey(nodeKey);
                if ($isVideoBlockNode(node)) {
                    updateFn(node);
                }
            });
        },
        [editor, nodeKey],
    );

    const handleLayout = (newLayout: 'inline' | 'breakout' | 'fullWidth') => {
        updateNode((node) => node.setLayout(newLayout));
    };

    const handleAlignment = (newAlignment: VideoBlockAlignment) => {
        updateNode((node) => node.setAlignment(newAlignment));
    };

    const handleDelete = () => {
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if (node) {
                node.remove();
            }
        });
    };

    const buttonClass = (isActive: boolean) =>
        `p-2 rounded hover:bg-muted text-muted-foreground transition-colors ${isActive ? 'bg-muted text-foreground' : ''}`;

    return (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-1.5 rounded-lg shadow-md border border-border z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {/* Alignment Group */}
            <div className="flex items-center gap-0.5 border-r border-border pr-1 mr-1">
                <button
                    onClick={() => handleAlignment('left')}
                    className={buttonClass(alignment === 'left' || !alignment)}
                    title="Align Left"
                >
                    <AlignLeft size={16} />
                </button>
                <button
                    onClick={() => handleAlignment('center')}
                    className={buttonClass(alignment === 'center')}
                    title="Align Center"
                >
                    <AlignCenter size={16} />
                </button>
                <button
                    onClick={() => handleAlignment('right')}
                    className={buttonClass(alignment === 'right')}
                    title="Align Right"
                >
                    <AlignRight size={16} />
                </button>
            </div>

            {/* Layout Group */}
            <div className="flex items-center gap-0.5 border-r border-border pr-1 mr-1">
                <button
                    onClick={() => handleLayout('inline')}
                    className={buttonClass(layout === 'inline' || !layout)}
                    title="Inline"
                >
                    <Minimize size={16} />
                </button>
                <button
                    onClick={() => handleLayout('breakout')}
                    className={buttonClass(layout === 'breakout')}
                    title="Breakout"
                >
                    <LayoutTemplate size={16} />
                </button>
                <button
                    onClick={() => handleLayout('fullWidth')}
                    className={buttonClass(layout === 'fullWidth')}
                    title="Full Width"
                >
                    <Expand size={16} />
                </button>
            </div>

            <button
                onClick={handleDelete}
                className="p-2 rounded hover:bg-destructive/10 text-destructive transition-colors"
                title="Delete Video"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
}
