import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTopLevelBlockNode } from './SelectedBlockTrackerPlugin';
import { ElementNode, LexicalNode, TextNode } from 'lexical';

// Mock Lexical nodes since we are unit testing logic that relies on node traversal
// We can mock the minimal interface needed: getType, getParent, getKey.

// Helper to create a mock node
function createMockNode(
  type: string,
  parent: LexicalNode | null = null,
  key: string = 'key',
) {
  return {
    getType: () => type,
    getParent: () => parent,
    getKey: () => key,
  } as unknown as LexicalNode;
}

// Since getTopLevelBlockNode uses instanceof check or similar logic?
// No, it just uses getParent() and getType().
// Let's look at the implementation source again:
// export function getTopLevelBlockNode(node: LexicalNode): LexicalNode | null {
//   let currentNode: LexicalNode | null = node;
//   while (currentNode !== null) {
//     const parent: ElementNode | null = currentNode.getParent();
//     if (parent && parent.getType() === 'root') {
//       return currentNode;
//     }
//     currentNode = parent;
//   }
//   return null;
// }

describe('SelectedBlockTrackerPlugin', () => {
  describe('getTopLevelBlockNode', () => {
    it('should return the node itself if it IS the top level block (parent is root)', () => {
      const rootNode = createMockNode('root', null, 'root');
      // @ts-ignore
      const paragraphNode = createMockNode('paragraph', rootNode, 'p1');

      expect(getTopLevelBlockNode(paragraphNode)).toBe(paragraphNode);
    });

    it('should traverse up from a nested text node to find the top level block', () => {
      const rootNode = createMockNode('root', null, 'root');
      // @ts-ignore
      const paragraphNode = createMockNode('paragraph', rootNode, 'p1');
      // @ts-ignore
      const textNode = createMockNode('text', paragraphNode, 't1');

      expect(getTopLevelBlockNode(textNode)).toBe(paragraphNode);
    });

    it('should traverse up from a nested element node (e.g. list item inside list) to find the top level block', () => {
      // e.g. Root -> List -> ListItem -> Text
      // Wait, normally List is top level.
      // Root -> List -> ListItem.
      // If selection is in ListItem, the top level block is the List?
      // Let's check "Group 6 – Inspector & Block Outline".
      // If I select a list item, usually the Block Outline shows around the List Item or the List?
      // "Track which top-level block is currently selected".
      // "Top-level block" implies direct child of root.
      // So validation: Root -> List (Top Level) -> ListItem -> Text.
      // If I am in Text, parent is ListItem, parent is List, parent is Root.
      // Should return List.

      const rootNode = createMockNode('root', null, 'root');
      // @ts-ignore
      const listNode = createMockNode('list', rootNode, 'list1');
      // @ts-ignore
      const listItemNode = createMockNode('listitem', listNode, 'li1');
      // @ts-ignore
      const textNode = createMockNode('text', listItemNode, 't1');

      expect(getTopLevelBlockNode(textNode)).toBe(listNode);
      expect(getTopLevelBlockNode(listItemNode)).toBe(listNode);
    });

    it('should return null if node is null', () => {
      // @ts-ignore
      expect(getTopLevelBlockNode(null)).toBeNull();
    });

    it('should return null if node is not attached to root', () => {
      const detachedNode = createMockNode('paragraph', null, 'p1');
      expect(getTopLevelBlockNode(detachedNode)).toBeNull();
    });
  });
});
