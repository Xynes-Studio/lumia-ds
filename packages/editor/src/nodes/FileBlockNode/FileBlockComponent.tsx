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
import { FileIcon, Download } from 'lucide-react';
import { $isFileBlockNode } from './FileBlockNode';

export interface FileBlockComponentProps {
  url: string;
  filename: string;
  size?: number;
  mime?: string;
  nodeKey: NodeKey;
}

export function FileBlockComponent({
  url,
  filename,
  size,
  nodeKey,
}: FileBlockComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelected] =
    useLexicalNodeSelection(nodeKey);
  const cardRef = useRef<HTMLDivElement>(null);

  const onDelete = React.useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isFileBlockNode($getNodeByKey(nodeKey))) {
        const event: KeyboardEvent = payload;
        event.preventDefault();
        const node = $getNodeByKey(nodeKey);
        if ($isFileBlockNode(node)) {
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
          if (
            cardRef.current &&
            cardRef.current.contains(event.target as Node)
          ) {
            // Allow default click behavior for links/buttons inside the card
            if (
              (event.target as HTMLElement).closest('a') ||
              (event.target as HTMLElement).closest('button')
            ) {
              return false;
            }

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

  const formatSize = (bytes?: number) => {
    if (bytes === undefined) return '';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="file-block-container my-4">
      <Card
        ref={cardRef}
        className={`flex items-center p-3 gap-3 transition-all duration-200 border ${
          isSelected
            ? 'ring-2 ring-primary ring-offset-2 border-primary'
            : 'hover:bg-muted/50'
        } max-w-md`}
      >
        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
          <FileIcon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" title={filename}>
            {filename}
          </p>
          {size !== undefined && (
            <p className="text-xs text-muted-foreground">{formatSize(size)}</p>
          )}
        </div>
        <a
          href={url}
          download={filename}
          className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Download"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Download className="h-4 w-4" />
        </a>
      </Card>
    </div>
  );
}
