import * as React from 'react';
import { useRef, useState } from 'react';
import { LexicalEditor, $getNodeByKey } from 'lexical';
import { $isImageBlockNode } from './ImageBlockNode';

interface ImageResizerProps {
  editor: LexicalEditor;
  nodeKey: string;
  imageRef: React.RefObject<HTMLElement>;
}

export function ImageResizer({
  editor,
  nodeKey,
  imageRef,
}: ImageResizerProps): React.JSX.Element {
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

    const image = imageRef.current;
    if (!image) return;

    const { width } = image.getBoundingClientRect();
    const startX = event.clientX;
    const startWidth = width;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const currentX = moveEvent.clientX;
      const diffX = currentX - startX;

      // Calculate new width
      let newWidth = startWidth + diffX * direction;

      // Constrain width
      const parentWidth =
        image.parentElement?.getBoundingClientRect().width || 1000;
      newWidth = Math.max(100, Math.min(newWidth, parentWidth));

      // Update the image style directly first
      image.style.width = `${newWidth}px`;
    };

    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      setIsResizing(false);

      // Commit final width
      const finalWidth = image.getBoundingClientRect().width;

      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageBlockNode(node)) {
          node.setWidth(finalWidth);
        }
      });
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div ref={controlWrapperRef}>
      {/* Right Handle */}
      <div
        className={`absolute top-0 bottom-0 right-0 w-2 cursor-ew-resize hover:bg-primary/50 transition-colors z-20 touch-none flex flex-col justify-center ${
          isResizing ? 'bg-primary' : ''
        }`}
        style={{ width: '12px', right: '-6px' }}
        onPointerDown={(e) => handlePointerDown(e, 1)}
      >
        <div className="h-8 w-1.5 bg-border rounded-full mx-auto" />
      </div>

      {/* Left Handle */}
      <div
        className={`absolute top-0 bottom-0 left-0 w-2 cursor-ew-resize hover:bg-primary/50 transition-colors z-20 touch-none flex flex-col justify-center ${
          isResizing ? 'bg-primary' : ''
        }`}
        style={{ width: '12px', left: '-6px' }}
        onPointerDown={(e) => handlePointerDown(e, -1)}
      >
        <div className="h-8 w-1.5 bg-border rounded-full mx-auto" />
      </div>
    </div>
  );
}
