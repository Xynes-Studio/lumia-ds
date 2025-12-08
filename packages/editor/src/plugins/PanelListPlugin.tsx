import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  COMMAND_PRIORITY_HIGH,
  KEY_ENTER_COMMAND,
  LexicalNode,
} from 'lexical';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  $createListItemNode,
  $createListNode,
  $isListItemNode,
  $isListNode,
  ListItemNode,
} from '@lexical/list';
import { $isPanelBlockNode } from '../nodes/PanelBlockNode/PanelBlockNode';

/**
 * Helper to check if a node is inside a panel
 */
function $isInsidePanel(node: LexicalNode): boolean {
  let current: LexicalNode | null = node;
  while (current !== null) {
    if ($isPanelBlockNode(current)) {
      return true;
    }
    current = current.getParent();
  }
  return false;
}

/**
 * Helper to get the panel ancestor
 */
function $getPanelAncestor(node: LexicalNode): LexicalNode | null {
  let current: LexicalNode | null = node;
  while (current !== null) {
    if ($isPanelBlockNode(current)) {
      return current;
    }
    current = current.getParent();
  }
  return null;
}

/**
 * Plugin that handles list commands inside panels.
 * When inside a panel, list commands should only affect the paragraph content,
 * not replace the entire panel.
 */
export function PanelListPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Handle Enter key to exit list when on empty item inside panel
    const unregisterEnter = editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return false;
        }

        const anchorNode = selection.anchor.getNode();

        // Check if we're inside a panel
        if (!$isInsidePanel(anchorNode)) {
          return false;
        }

        // Find the list item we're in
        let listItem: ListItemNode | null = null;
        let current: LexicalNode | null = anchorNode;
        while (current !== null) {
          if ($isListItemNode(current)) {
            listItem = current;
            break;
          }
          current = current.getParent();
        }

        if (!listItem) {
          return false;
        }

        // Check if the list item is empty
        const isEmpty =
          listItem.getTextContentSize() === 0 ||
          (listItem.getChildrenSize() === 1 &&
            listItem.getFirstChild()?.getTextContentSize() === 0);

        if (!isEmpty) {
          return false;
        }

        // Exit the list: remove this empty item and create a paragraph after the list
        event?.preventDefault();

        const listNode = listItem.getParent();
        if (!listNode || !$isListNode(listNode)) {
          return false;
        }

        // Create new paragraph
        const paragraph = $createParagraphNode();

        // If this is the only item in the list, replace the whole list with paragraph
        if (listNode.getChildrenSize() === 1) {
          listNode.replace(paragraph);
        } else {
          // Remove the empty list item and insert paragraph after list
          listItem.remove();
          listNode.insertAfter(paragraph);
        }

        paragraph.select();
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );

    // Handle bullet list inside panels
    const unregisterBullet = editor.registerCommand(
      INSERT_UNORDERED_LIST_COMMAND,
      () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }

        const anchorNode = selection.anchor.getNode();

        // Check if we're inside a panel
        if ($isInsidePanel(anchorNode)) {
          // Get the paragraph or block element we're in
          const parent = anchorNode.getParent();
          if (!parent) return false;

          // Don't handle if already in a list
          if ($isListItemNode(parent) || $isListNode(parent)) {
            return false;
          }

          // Create new list with current selection content
          const listNode = $createListNode('bullet');
          const listItemNode = $createListItemNode();

          // Get the text content and move text nodes to list item
          const selectedNodes = selection.getNodes();
          selectedNodes.forEach((node) => {
            if (node.getParent() === parent) {
              listItemNode.append(node);
            }
          });

          listNode.append(listItemNode);

          // Replace the parent paragraph with the list
          parent.replace(listNode);

          // Select inside the list item
          listItemNode.selectEnd();

          return true;
        }

        // Not inside panel, let default handler take over
        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );

    // Handle numbered list inside panels
    const unregisterNumbered = editor.registerCommand(
      INSERT_ORDERED_LIST_COMMAND,
      () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }

        const anchorNode = selection.anchor.getNode();

        // Check if we're inside a panel
        if ($isInsidePanel(anchorNode)) {
          // Get the paragraph or block element we're in
          const parent = anchorNode.getParent();
          if (!parent) return false;

          // Don't handle if already in a list
          if ($isListItemNode(parent) || $isListNode(parent)) {
            return false;
          }

          // Create new list with current selection content
          const listNode = $createListNode('number');
          const listItemNode = $createListItemNode();

          // Get the text content and move text nodes to list item
          const selectedNodes = selection.getNodes();
          selectedNodes.forEach((node) => {
            if (node.getParent() === parent) {
              listItemNode.append(node);
            }
          });

          listNode.append(listItemNode);

          // Replace the parent paragraph with the list
          parent.replace(listNode);

          // Select inside the list item
          listItemNode.selectEnd();

          return true;
        }

        // Not inside panel, let default handler take over
        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );

    return () => {
      unregisterEnter();
      unregisterBullet();
      unregisterNumbered();
    };
  }, [editor]);

  return null;
}
