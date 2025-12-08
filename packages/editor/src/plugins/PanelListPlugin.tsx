import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  COMMAND_PRIORITY_HIGH,
  KEY_ENTER_COMMAND,
} from 'lexical';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  $createListItemNode,
  $createListNode,
  $isListItemNode,
  $isListNode,
} from '@lexical/list';
import {
  $isInsidePanel,
  $findParentListItem,
  isListItemEmpty,
  isInsideList,
  getParentList,
  isListSingleItem,
} from '../utils/panelListUtils';

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

        // Find the list item we're in using the util
        const listItem = $findParentListItem(anchorNode);
        if (!listItem) {
          return false;
        }

        // Check if the list item is empty using the util
        if (!isListItemEmpty(listItem)) {
          return false;
        }

        // Exit the list: remove this empty item and create a paragraph after the list
        event?.preventDefault();

        const listNode = getParentList(listItem);
        if (!listNode) {
          return false;
        }

        // Create new paragraph
        const paragraph = $createParagraphNode();

        // If this is the only item in the list, replace the whole list with paragraph
        if (isListSingleItem(listNode)) {
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
