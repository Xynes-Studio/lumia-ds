import { describe, test, expect } from 'vitest';
import { createHeadlessEditor } from '@lexical/headless';
import {
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  ParagraphNode,
  TextNode,
} from 'lexical';
import {
  ListNode,
  ListItemNode,
  $createListNode,
  $createListItemNode,
} from '@lexical/list';
import {
  PanelBlockNode,
  $createPanelBlockNode,
} from '../../nodes/PanelBlockNode/PanelBlockNode';
import {
  $isInsidePanel,
  $findParentListItem,
  isListItemEmpty,
  isInsideList,
  getParentList,
  isListSingleItem,
  shouldExitListOnEnter,
  getListType,
} from '../panelListUtils';

describe('panelListUtils', () => {
  const editorConfig = {
    namespace: 'test',
    nodes: [ParagraphNode, TextNode, ListNode, ListItemNode, PanelBlockNode],
    onError: (error: Error) => {
      throw error;
    },
  };

  describe('$isInsidePanel', () => {
    test('returns true for node inside panel', () => {
      const editor = createHeadlessEditor(editorConfig);

      editor.update(() => {
        const root = $getRoot();
        const panel = $createPanelBlockNode({ variant: 'info', title: 'Test' });
        const paragraph = $createParagraphNode();
        const text = $createTextNode('Inside panel');

        paragraph.append(text);
        panel.append(paragraph);
        root.append(panel);

        expect($isInsidePanel(text)).toBe(true);
        expect($isInsidePanel(paragraph)).toBe(true);
      });
    });

    test('returns false for node outside panel', () => {
      const editor = createHeadlessEditor(editorConfig);

      editor.update(() => {
        const root = $getRoot();
        const paragraph = $createParagraphNode();
        const text = $createTextNode('Outside panel');

        paragraph.append(text);
        root.append(paragraph);

        expect($isInsidePanel(text)).toBe(false);
        expect($isInsidePanel(paragraph)).toBe(false);
      });
    });
  });

  describe('$findParentListItem', () => {
    test('returns list item for text inside list', () => {
      const editor = createHeadlessEditor(editorConfig);

      editor.update(() => {
        const root = $getRoot();
        const list = $createListNode('bullet');
        const listItem = $createListItemNode();
        const text = $createTextNode('List item text');

        listItem.append(text);
        list.append(listItem);
        root.append(list);

        const found = $findParentListItem(text);
        expect(found).not.toBeNull();
        expect(found).toBe(listItem);
      });
    });

    test('returns null for text not in list', () => {
      const editor = createHeadlessEditor(editorConfig);

      editor.update(() => {
        const root = $getRoot();
        const paragraph = $createParagraphNode();
        const text = $createTextNode('Not in list');

        paragraph.append(text);
        root.append(paragraph);

        expect($findParentListItem(text)).toBeNull();
      });
    });
  });

  describe('isListItemEmpty', () => {
    test('returns true for empty list item', () => {
      const editor = createHeadlessEditor(editorConfig);

      editor.update(() => {
        const root = $getRoot();
        const list = $createListNode('bullet');
        const listItem = $createListItemNode();

        list.append(listItem);
        root.append(list);

        expect(isListItemEmpty(listItem)).toBe(true);
      });
    });

    test('returns false for list item with text', () => {
      const editor = createHeadlessEditor(editorConfig);

      editor.update(() => {
        const root = $getRoot();
        const list = $createListNode('bullet');
        const listItem = $createListItemNode();
        const text = $createTextNode('Has content');

        listItem.append(text);
        list.append(listItem);
        root.append(list);

        expect(isListItemEmpty(listItem)).toBe(false);
      });
    });
  });

  describe('isInsideList', () => {
    test('returns true for list item node', () => {
      const editor = createHeadlessEditor(editorConfig);

      editor.update(() => {
        const listItem = $createListItemNode();
        expect(isInsideList(listItem)).toBe(true);
      });
    });

    test('returns true for list node', () => {
      const editor = createHeadlessEditor(editorConfig);

      editor.update(() => {
        const list = $createListNode('bullet');
        expect(isInsideList(list)).toBe(true);
      });
    });

    test('returns false for paragraph node', () => {
      const editor = createHeadlessEditor(editorConfig);

      editor.update(() => {
        const paragraph = $createParagraphNode();
        expect(isInsideList(paragraph)).toBe(false);
      });
    });

    test('returns false for null', () => {
      expect(isInsideList(null)).toBe(false);
    });
  });

  describe('getParentList', () => {
    test('returns parent list for list item', () => {
      const editor = createHeadlessEditor(editorConfig);

      editor.update(() => {
        const root = $getRoot();
        const list = $createListNode('bullet');
        const listItem = $createListItemNode();

        list.append(listItem);
        root.append(list);

        const parent = getParentList(listItem);
        expect(parent).toBe(list);
      });
    });
  });

  describe('isListSingleItem', () => {
    test('returns true for list with one item', () => {
      const editor = createHeadlessEditor(editorConfig);

      editor.update(() => {
        const root = $getRoot();
        const list = $createListNode('bullet');
        const listItem = $createListItemNode();

        list.append(listItem);
        root.append(list);

        expect(isListSingleItem(list)).toBe(true);
      });
    });

    test('returns false for list with multiple items', () => {
      const editor = createHeadlessEditor(editorConfig);

      editor.update(() => {
        const root = $getRoot();
        const list = $createListNode('bullet');
        const item1 = $createListItemNode();
        const item2 = $createListItemNode();

        list.append(item1);
        list.append(item2);
        root.append(list);

        expect(isListSingleItem(list)).toBe(false);
      });
    });
  });

  describe('shouldExitListOnEnter', () => {
    test('returns true when in panel with empty list item', () => {
      const editor = createHeadlessEditor(editorConfig);

      editor.update(() => {
        const listItem = $createListItemNode();
        expect(shouldExitListOnEnter(true, listItem, true)).toBe(true);
      });
    });

    test('returns false when not in panel', () => {
      const editor = createHeadlessEditor(editorConfig);

      editor.update(() => {
        const listItem = $createListItemNode();
        expect(shouldExitListOnEnter(false, listItem, true)).toBe(false);
      });
    });

    test('returns false when list item is not empty', () => {
      const editor = createHeadlessEditor(editorConfig);

      editor.update(() => {
        const listItem = $createListItemNode();
        expect(shouldExitListOnEnter(true, listItem, false)).toBe(false);
      });
    });

    test('returns false when no list item', () => {
      expect(shouldExitListOnEnter(true, null, true)).toBe(false);
    });
  });

  describe('getListType', () => {
    test('returns number for ordered list', () => {
      expect(getListType(true)).toBe('number');
    });

    test('returns bullet for unordered list', () => {
      expect(getListType(false)).toBe('bullet');
    });
  });
});
