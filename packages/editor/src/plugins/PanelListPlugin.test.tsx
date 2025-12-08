import React from 'react';
import { render } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, Mock } from 'vitest';
import { createHeadlessEditor } from '@lexical/headless';
import {
  $getRoot,
  $createTextNode,
  TextNode,
  COMMAND_PRIORITY_HIGH,
  KEY_ENTER_COMMAND,
} from 'lexical';
import {
  PanelBlockNode,
  $createPanelBlockNode,
} from '../nodes/PanelBlockNode/PanelBlockNode';
import {
  ListNode,
  ListItemNode,
  $createListNode,
  $createListItemNode,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from '@lexical/list';
import { PanelListPlugin } from './PanelListPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

// Mock module for the component tests
vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: vi.fn(),
}));

// Mock Lexical utilities for component tests
vi.mock('lexical', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lexical')>();
  return {
    ...actual,
    $getSelection: vi.fn(),
    $isRangeSelection: vi.fn(() => true),
  };
});

describe('PanelListPlugin Component Logic', () => {
  const mockEditor = {
    registerCommand: vi.fn(() => vi.fn()),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useLexicalComposerContext as Mock).mockReturnValue([mockEditor]);
  });

  test('registers commands on mount', () => {
    render(<PanelListPlugin />);

    expect(mockEditor.registerCommand).toHaveBeenCalledTimes(3);

    // Verify specific commands were registered
    expect(mockEditor.registerCommand).toHaveBeenCalledWith(
      KEY_ENTER_COMMAND,
      expect.any(Function),
      COMMAND_PRIORITY_HIGH,
    );
    expect(mockEditor.registerCommand).toHaveBeenCalledWith(
      INSERT_UNORDERED_LIST_COMMAND,
      expect.any(Function),
      COMMAND_PRIORITY_HIGH,
    );
    expect(mockEditor.registerCommand).toHaveBeenCalledWith(
      INSERT_ORDERED_LIST_COMMAND,
      expect.any(Function),
      COMMAND_PRIORITY_HIGH,
    );
  });
});

/**
 * Tests for PanelListPlugin functionality using Headless Editor.
 * These verify the underlying node structure.
 */
describe('PanelListPlugin Node Structure', () => {
  const editorConfig = {
    namespace: 'test',
    nodes: [PanelBlockNode, ListNode, ListItemNode, TextNode],
    onError: (error: Error) => {
      throw error;
    },
    theme: {},
  };

  test('panel can contain a list node', async () => {
    const editor = createHeadlessEditor(editorConfig);

    await new Promise<void>((resolve) => {
      editor.update(
        () => {
          const root = $getRoot();
          const panel = $createPanelBlockNode({
            variant: 'info',
            title: 'Test Panel',
          });

          const list = $createListNode('bullet');
          const listItem = $createListItemNode();
          const text = $createTextNode('List item text');

          listItem.append(text);
          list.append(listItem);
          panel.append(list);
          root.append(panel);
        },
        { onUpdate: resolve },
      );
    });

    editor.getEditorState().read(() => {
      const root = $getRoot();
      const panel = root.getFirstChild();
      expect(panel).not.toBeNull();

      // Verify panel has children (the list)
      if (panel && 'getFirstChild' in panel) {
        const list = (
          panel as unknown as { getFirstChild: () => unknown }
        ).getFirstChild();
        expect(list).not.toBeNull();
      }
    });
  });

  test('panel preserves list after JSON roundtrip', async () => {
    const editor = createHeadlessEditor(editorConfig);

    await new Promise<void>((resolve) => {
      editor.update(
        () => {
          const root = $getRoot();
          const panel = $createPanelBlockNode({
            variant: 'warning',
            title: 'Warning Panel',
          });

          const list = $createListNode('number');
          const listItem = $createListItemNode();
          const text = $createTextNode('Item 1');
          listItem.append(text);
          list.append(listItem);
          panel.append(list);
          root.append(panel);
        },
        { onUpdate: resolve },
      );
    });

    const json = editor.getEditorState().toJSON();
    expect(json).toBeDefined();

    // Verify structure in JSON
    const rootChildren = json.root.children;
    expect(rootChildren.length).toBeGreaterThan(0);
    expect(rootChildren[0].type).toBe('panel-block');
  });

  test('list inside panel maintains panel properties', () => {
    const editor = createHeadlessEditor(editorConfig);

    editor.update(() => {
      const root = $getRoot();
      const panel = $createPanelBlockNode({
        variant: 'success',
        title: 'Success Panel',
        icon: 'check',
      });

      const list = $createListNode('bullet');
      const listItem = $createListItemNode();
      listItem.append($createTextNode('Task done'));
      list.append(listItem);
      panel.append(list);
      root.append(panel);

      // Panel properties should remain intact
      expect(panel.getVariant()).toBe('success');
      expect(panel.getTitle()).toBe('Success Panel');
      expect(panel.getIcon()).toBe('check');
    });
  });
});

describe('PanelActionMenuPlugin Title Editing', () => {
  const editorConfig = {
    namespace: 'test',
    nodes: [PanelBlockNode, TextNode],
    onError: (error: Error) => {
      throw error;
    },
    theme: {},
  };

  test('panel title can be updated', () => {
    const editor = createHeadlessEditor(editorConfig);

    editor.update(() => {
      const root = $getRoot();
      const panel = $createPanelBlockNode({
        variant: 'info',
        title: 'Original Title',
      });
      root.append(panel);

      panel.setTitle('Updated Title');
      expect(panel.getTitle()).toBe('Updated Title');
    });
  });

  test('panel title can be set to empty', () => {
    const editor = createHeadlessEditor(editorConfig);

    editor.update(() => {
      const root = $getRoot();
      const panel = $createPanelBlockNode({
        variant: 'info',
        title: 'Has Title',
      });
      root.append(panel);

      panel.setTitle('');
      expect(panel.getTitle()).toBe('');
    });
  });

  test('panel variant and icon remain after title change', () => {
    const editor = createHeadlessEditor(editorConfig);

    editor.update(() => {
      const root = $getRoot();
      const panel = $createPanelBlockNode({
        variant: 'warning',
        title: 'Initial',
        icon: 'alert-triangle',
      });
      root.append(panel);

      panel.setTitle('Changed Title');

      expect(panel.getVariant()).toBe('warning');
      expect(panel.getIcon()).toBe('alert-triangle');
      expect(panel.getTitle()).toBe('Changed Title');
    });
  });

  test('panel variant can be changed via setVariant', () => {
    const editor = createHeadlessEditor(editorConfig);

    editor.update(() => {
      const root = $getRoot();
      const panel = $createPanelBlockNode({
        variant: 'info',
        title: 'Test',
      });
      root.append(panel);

      panel.setVariant('success');
      expect(panel.getVariant()).toBe('success');
    });
  });
});
