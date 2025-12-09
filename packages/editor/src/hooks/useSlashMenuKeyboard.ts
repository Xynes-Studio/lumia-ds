/**
 * useSlashMenuKeyboard - Hook for handling keyboard events for slash menu.
 * Extracted from SlashMenuPlugin for modularity and testability.
 */
import { useEffect } from 'react';
import { LexicalEditor } from 'lexical';
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  $isElementNode,
  COMMAND_PRIORITY_LOW,
  KEY_DOWN_COMMAND,
} from 'lexical';
import {
  shouldTriggerSlashMenu,
  isEmptyRect,
  calculateMenuPosition,
  calculateFallbackPosition,
} from '../utils/slashMenuUtils';

export interface SlashMenuKeyboardOptions {
  editor: LexicalEditor;
  onOpenMenu: (
    position: { top: number; left: number },
    nodeKey: string,
    offset: number,
  ) => void;
}

/**
 * Hook that handles keyboard events for triggering the slash menu.
 * Registers a KEY_DOWN_COMMAND listener to detect '/' at valid positions.
 */
export function useSlashMenuKeyboard({
  editor,
  onOpenMenu,
}: SlashMenuKeyboardOptions): void {
  useEffect(() => {
    const removeKeyDownListener = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        if (event.key !== '/') {
          return false;
        }

        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return false;
        }

        const anchor = selection.anchor;
        const anchorNode = anchor.getNode();

        // Handle text nodes
        if ($isTextNode(anchorNode)) {
          const textContent = anchorNode.getTextContent();
          const offset = anchor.offset;
          const textBeforeCursor = textContent.substring(0, offset);

          if (!shouldTriggerSlashMenu(offset, textBeforeCursor)) {
            return false;
          }

          const domSelection = window.getSelection();
          if (domSelection && domSelection.rangeCount > 0) {
            const range = domSelection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const position = calculateMenuPosition(rect);
            onOpenMenu(position, anchorNode.getKey(), offset);
          }
        }
        // Handle empty element nodes (e.g., empty paragraphs)
        else if ($isElementNode(anchorNode) && anchor.offset === 0) {
          const domSelection = window.getSelection();
          if (domSelection && domSelection.rangeCount > 0) {
            const range = domSelection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            let position: { top: number; left: number };

            // Fallback for empty elements with zero-dimension rects
            if (isEmptyRect(rect)) {
              const element = editor.getElementByKey(anchorNode.getKey());
              if (element) {
                position = calculateFallbackPosition(
                  element.getBoundingClientRect(),
                );
              } else {
                position = calculateMenuPosition(rect);
              }
            } else {
              position = calculateMenuPosition(rect);
            }

            onOpenMenu(position, anchorNode.getKey(), 0);
          }
        }

        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    return () => {
      removeKeyDownListener();
    };
  }, [editor, onOpenMenu]);
}
