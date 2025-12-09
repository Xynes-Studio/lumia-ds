/**
 * useSlashMenuKeyboard - Hook for handling keyboard events for slash menu.
 * Refactored to use processKeyboardTrigger from slashMenuUtils for testability.
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
  processKeyboardTrigger,
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
 * Uses processKeyboardTrigger pure function for trigger detection logic.
 */
export function useSlashMenuKeyboard({
  editor,
  onOpenMenu,
}: SlashMenuKeyboardOptions): void {
  useEffect(() => {
    const removeKeyDownListener = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        const selection = $getSelection();

        // Build input for pure function
        const isValidSelection =
          $isRangeSelection(selection) && selection.isCollapsed();

        if (!isValidSelection || !$isRangeSelection(selection)) {
          return false;
        }

        const anchor = selection.anchor;
        const anchorNode = anchor.getNode();
        const isTextNodeType = $isTextNode(anchorNode);
        const isElementNodeType = $isElementNode(anchorNode);

        const textBeforeCursor = isTextNodeType
          ? anchorNode.getTextContent().substring(0, anchor.offset)
          : '';

        // Use pure function for trigger detection
        const result = processKeyboardTrigger({
          key: event.key,
          hasValidSelection: true,
          isTextNode: isTextNodeType,
          isElementNode: isElementNodeType,
          anchorOffset: anchor.offset,
          textBeforeCursor,
        });

        if (!result.shouldTrigger) {
          return false;
        }

        // Calculate position based on DOM
        const domSelection = window.getSelection();
        if (!domSelection || domSelection.rangeCount === 0) {
          return false;
        }

        const range = domSelection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        let position: { top: number; left: number };

        if (result.isEmptyElement && isEmptyRect(rect)) {
          // Fallback for empty elements
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

        onOpenMenu(position, anchorNode.getKey(), anchor.offset);
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    return () => {
      removeKeyDownListener();
    };
  }, [editor, onOpenMenu]);
}
