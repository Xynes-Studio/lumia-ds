import type { NodeKey } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import {
  $getNodeByKey,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_DELETE_COMMAND,
  KEY_BACKSPACE_COMMAND,
} from 'lexical';
import * as React from 'react';
import { useEffect, useRef } from 'react';
import { Card } from '@lumia/components';
import { $isImageBlockNode } from './ImageBlockNode';

export interface ImageBlockComponentProps {
  src: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  nodeKey: NodeKey;
}

export function ImageBlockComponent({
  src,
  alt,
  caption,
  width,
  height,
  nodeKey,
}: ImageBlockComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelected] =
    useLexicalNodeSelection(nodeKey);
  const imageRef = useRef<HTMLImageElement>(null);

  const onDelete = React.useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isImageBlockNode($getNodeByKey(nodeKey))) {
        const event: KeyboardEvent = payload;
        event.preventDefault();
        const node = $getNodeByKey(nodeKey);
        if ($isImageBlockNode(node)) {
          node.remove();
        }
        return true;
      }
      return false;
    },
    [isSelected, nodeKey],
  );

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          if (event.target === imageRef.current) {
            if (event.shiftKey) {
              setSelected(!isSelected);
            } else {
              clearSelected();
              setSelected(true);
            }
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [clearSelected, editor, isSelected, onDelete, setSelected]);

  return (
    <Card
      className={`w-fit overflow-hidden transition-all duration-200 ${
        isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
      }`}
    >
      <figure className="m-0 flex flex-col">
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="max-w-full h-auto block select-none"
          draggable="false"
        />
        {caption && (
          <figcaption className="p-2 text-sm text-muted-foreground border-t border-border bg-muted/30">
            {caption}
          </figcaption>
        )}
      </figure>
    </Card>
  );
}
