/**
 * useSlashMenuQuery - Hook for tracking query updates in slash menu.
 * Extracted from SlashMenuPlugin for modularity and testability.
 *
 * This hook uses the pure processQueryUpdate function from slashMenuUtils
 * to keep business logic testable.
 */
import { useEffect, useRef } from 'react';
import { LexicalEditor, NodeKey } from 'lexical';
import {
  $getSelection,
  $isRangeSelection,
  $getNodeByKey,
  $isTextNode,
  $isElementNode,
} from 'lexical';
import { processQueryUpdate, QueryUpdateInput } from '../utils/slashMenuUtils';

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
  // BUG-LDS-5 / Bug C: once we have observed a text child after the menu opened,
  // any subsequent absence means the user deleted the `/` trigger and we must
  // close. The ref is keyed by the trigger node and resets on close/re-open.
  const hasObservedTextChildRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      hasObservedTextChildRef.current = false;
      return;
    }

    const removeUpdateListener = editor.registerUpdateListener(
      ({ editorState }) => {
        editorState.read(() => {
          if (!triggerNodeKey) {
            return;
          }

          const node = $getNodeByKey(triggerNodeKey);

          // Build input for pure function
          const input: QueryUpdateInput = {
            nodeExists: node !== null,
            isElementNode: node ? $isElementNode(node) : false,
            hasTextChild: false,
            textContent: '',
            triggerOffset,
            triggerNodeKey,
            hasValidSelection: false,
            selectionNodeKey: '',
            textNodeKey: null,
            selectionIsTextNode: false,
            cursorOffset: 0,
            hasObservedTextChild: hasObservedTextChildRef.current,
          };

          // Get text node and content if node exists
          if (node) {
            if ($isElementNode(node)) {
              const firstChild = node.getFirstChild();
              if (firstChild && $isTextNode(firstChild)) {
                input.hasTextChild = true;
                input.textContent = firstChild.getTextContent();
                input.textNodeKey = firstChild.getKey();
              }
            } else if ($isTextNode(node)) {
              input.textContent = node.getTextContent();
              input.textNodeKey = node.getKey();
              input.hasTextChild = true;
            }
          }

          // Latch the "observed once" flag for BUG-LDS-5 / Bug C.
          if (input.hasTextChild) {
            hasObservedTextChildRef.current = true;
            input.hasObservedTextChild = true;
          }

          // Get selection info
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            input.hasValidSelection = true;
            const anchorNode = selection.anchor.getNode();
            input.selectionNodeKey = anchorNode.getKey();
            input.selectionIsTextNode = $isTextNode(anchorNode);
            input.cursorOffset = selection.anchor.offset;
          }

          // Process using pure function
          const result = processQueryUpdate(input);

          if (result.shouldClose) {
            onClose();
          } else if (result.shouldUpdate) {
            onUpdateQuery(result.query);
          }
        });
      },
    );

    return () => {
      removeUpdateListener();
    };
  }, [editor, isOpen, triggerNodeKey, triggerOffset, onUpdateQuery, onClose]);
}
