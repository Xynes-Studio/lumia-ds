/**
 * Pure utility functions for Panel and List handling.
 * Extracted from PanelListPlugin for testability.
 */

import { LexicalNode } from 'lexical';
import { $isListItemNode, $isListNode, ListItemNode, ListNode } from '@lexical/list';
import { $isPanelBlockNode } from '../nodes/PanelBlockNode/PanelBlockNode';

/**
 * Check if a node is inside a panel block.
 * Traverses up the tree to find a panel ancestor.
 * @param node - The node to check
 * @returns True if the node is inside a panel
 */
export function $isInsidePanel(node: LexicalNode): boolean {
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
 * Find the parent list item of a node.
 * @param node - The starting node
 * @returns The parent ListItemNode or null
 */
export function $findParentListItem(node: LexicalNode): ListItemNode | null {
    let current: LexicalNode | null = node;
    while (current !== null) {
        if ($isListItemNode(current)) {
            return current;
        }
        current = current.getParent();
    }
    return null;
}

/**
 * Check if a list item is empty.
 * @param listItem - The list item to check
 * @returns True if the list item has no content
 */
export function isListItemEmpty(listItem: ListItemNode): boolean {
    return (
        listItem.getTextContentSize() === 0 ||
        (listItem.getChildrenSize() === 1 &&
            listItem.getFirstChild()?.getTextContentSize() === 0)
    );
}

/**
 * Check if a node is inside a list (either list item or list node).
 * @param node - The node to check
 * @returns True if inside a list structure
 */
export function isInsideList(node: LexicalNode | null): boolean {
    if (!node) return false;
    return $isListItemNode(node) || $isListNode(node);
}

/**
 * Get the parent list of a list item.
 * @param listItem - The list item
 * @returns The parent ListNode or null
 */
export function getParentList(listItem: ListItemNode): ListNode | null {
    const parent = listItem.getParent();
    if (!parent || !$isListNode(parent)) {
        return null;
    }
    return parent;
}

/**
 * Check if a list has only one item.
 * @param listNode - The list node
 * @returns True if the list has exactly one child
 */
export function isListSingleItem(listNode: ListNode): boolean {
    return listNode.getChildrenSize() === 1;
}

/**
 * Determine if Enter key should exit a list inside panel.
 * @param isInPanel - Whether we're in a panel
 * @param listItem - The current list item (or null)
 * @param isEmpty - Whether the list item is empty
 * @returns True if we should exit the list
 */
export function shouldExitListOnEnter(
    isInPanel: boolean,
    listItem: ListItemNode | null,
    isEmpty: boolean,
): boolean {
    return isInPanel && listItem !== null && isEmpty;
}

/**
 * Create list type from command.
 * @param isOrdered - Whether this is an ordered list
 * @returns The list type string
 */
export function getListType(isOrdered: boolean): 'bullet' | 'number' {
    return isOrdered ? 'number' : 'bullet';
}
