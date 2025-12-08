import * as React from 'react';
import { useRef, useState } from 'react';
import { LexicalEditor } from 'lexical';

interface MediaResizerProps {
    editor: LexicalEditor;
    mediaRef: React.RefObject<HTMLElement>;
    onWidthChange: (width: number) => void;
}

export function MediaResizer({
    editor,
    mediaRef,
    onWidthChange,
}: MediaResizerProps): React.JSX.Element {
    const controlWrapperRef = useRef<HTMLDivElement>(null);
    const [isResizing, setIsResizing] = useState(false);

    const handlePointerDown = (
        event: React.PointerEvent<HTMLDivElement>,
        direction: number,
    ) => {
        if (!editor.isEditable()) {
            return;
        }
        event.preventDefault();
        setIsResizing(true);

        const media = mediaRef.current;
        if (!media) return;

        const { width } = media.getBoundingClientRect();
        const startX = event.clientX;
        const startWidth = width;

        const handlePointerMove = (moveEvent: PointerEvent) => {
            const currentX = moveEvent.clientX;
            const diffX = currentX - startX;

            // Calculate new width
            let newWidth = startWidth + diffX * direction;

            // Constrain width - use editor container width, not immediate parent
            // This allows resizing back up after making smaller
            const editorContainer = media.closest('.editor-input') || media.closest('[data-lexical-editor]');
            const maxWidth = editorContainer?.getBoundingClientRect().width || 1000;
            newWidth = Math.max(100, Math.min(newWidth, maxWidth));

            // Update the media style directly first
            media.style.width = `${newWidth}px`;
        };

        const handlePointerUp = () => {
            document.removeEventListener('pointermove', handlePointerMove);
            document.removeEventListener('pointerup', handlePointerUp);
            setIsResizing(false);

            // Commit final width
            const finalWidth = media.getBoundingClientRect().width;
            onWidthChange(finalWidth);
        };

        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerUp);
    };

    return (
        <div ref={controlWrapperRef}>
            {/* Right Handle */}
            <div
                className={`absolute top-0 bottom-0 right-0 w-2 cursor-ew-resize hover:bg-primary/50 transition-colors z-20 touch-none flex flex-col justify-center ${isResizing ? 'bg-primary' : ''
                    }`}
                style={{ width: '12px', right: '-6px' }}
                onPointerDown={(e) => handlePointerDown(e, 1)}
            >
                <div className="h-8 w-1.5 bg-border rounded-full mx-auto" />
            </div>

            {/* Left Handle */}
            <div
                className={`absolute top-0 bottom-0 left-0 w-2 cursor-ew-resize hover:bg-primary/50 transition-colors z-20 touch-none flex flex-col justify-center ${isResizing ? 'bg-primary' : ''
                    }`}
                style={{ width: '12px', left: '-6px' }}
                onPointerDown={(e) => handlePointerDown(e, -1)}
            >
                <div className="h-8 w-1.5 bg-border rounded-full mx-auto" />
            </div>
        </div>
    );
}
