/**
 * useSlashMenuQuery - Hook for tracking query updates in slash menu.
 * Extracted from SlashMenuPlugin for modularity and testability.
 */
import { useEffect } from 'react';
import { LexicalEditor, NodeKey } from 'lexical';
import {
  $getSelection,
  $isRangeSelection,
  $getNodeByKey,
  $isTextNode,
  $isElementNode,
} from 'lexical';
import {
  extractQueryWithCursor,
  isSlashStillPresent,
  isSelectionInValidNode,
  getCorrectedSlashIndex,
} from '../utils/slashMenuUtils';

export interface SlashMenuQueryOptions {
  editor: LexicalEditor;
  isOpen: boolean;
  triggerNodeKey: NodeKey | null;
  triggerOffset: number;
  onUpdateQuery: (query: string) => void;
  onClose: () => void;
}

/**
 * Hook that tracks editor updates to maintain query state for the slash menu.
 * Monitors text changes and cursor position to update or close the menu.
 */
export function useSlashMenuQuery({
  editor,
  isOpen,
  triggerNodeKey,
  triggerOffset,
  onUpdateQuery,
  onClose,
}: SlashMenuQueryOptions): void {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const removeUpdateListener = editor.registerUpdateListener(
      ({ editorState }) => {
        editorState.read(() => {
          if (!triggerNodeKey) {
            return;
          }

          const node = $getNodeByKey(triggerNodeKey);
          if (!node) {
            onClose();
            return;
          }

          let textNode = node;
          let slashIndex = triggerOffset;

          // Handle element nodes (e.g., when slash was typed in empty paragraph)
          if ($isElementNode(node)) {
            const firstChild = node.getFirstChild();
            if (!firstChild || !$isTextNode(firstChild)) {
              // No text child yet, menu should stay open waiting for text
              return;
            }
            textNode = firstChild;
            slashIndex = getCorrectedSlashIndex(true, triggerOffset);
          } else if (!$isTextNode(node)) {
            onClose();
            return;
          }

          const textContent = textNode.getTextContent();

          // Check if slash is still there
          if (!isSlashStillPresent(textContent, slashIndex)) {
            onClose();
            return;
          }

          // Get current selection
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) {
            onClose();
            return;
          }

          const anchor = selection.anchor;
          const anchorNode = anchor.getNode();

          // Validate selection is in expected node
          const isValid = isSelectionInValidNode(
            anchorNode.getKey(),
            triggerNodeKey,
            $isTextNode(textNode) ? textNode.getKey() : null,
            $isTextNode(anchorNode),
          );

          if (!isValid) {
            onClose();
            return;
          }

          // Extract and validate query
          const { query, isValid: queryValid } = extractQueryWithCursor(
            textContent,
            slashIndex,
            anchor.offset,
          );

          if (!queryValid) {
            onClose();
            return;
          }

          onUpdateQuery(query);
        });
      },
    );

    return () => {
      removeUpdateListener();
    };
  }, [editor, isOpen, triggerNodeKey, triggerOffset, onUpdateQuery, onClose]);
}
