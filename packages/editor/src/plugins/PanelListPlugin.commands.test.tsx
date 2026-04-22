import React from 'react';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { PanelListPlugin } from './PanelListPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
} from 'lexical';
import {
  $createListItemNode,
  $createListNode,
  $isListItemNode,
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import {
  $findParentListItem,
  $isInsidePanel,
  getParentList,
  isListItemEmpty,
  isListSingleItem,
} from '../utils/panelListUtils';

vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: vi.fn(),
}));

vi.mock('lexical', () => ({
  $createParagraphNode: vi.fn(),
  $getSelection: vi.fn(),
  $isRangeSelection: vi.fn(),
  COMMAND_PRIORITY_HIGH: 'high',
  KEY_ENTER_COMMAND: 'KEY_ENTER_COMMAND',
}));

vi.mock('@lexical/list', () => ({
  $createListItemNode: vi.fn(),
  $createListNode: vi.fn(),
  $isListItemNode: vi.fn(),
  $isListNode: vi.fn(),
  INSERT_ORDERED_LIST_COMMAND: 'INSERT_ORDERED_LIST_COMMAND',
  INSERT_UNORDERED_LIST_COMMAND: 'INSERT_UNORDERED_LIST_COMMAND',
}));

vi.mock('../utils/panelListUtils', () => ({
  $findParentListItem: vi.fn(),
  $isInsidePanel: vi.fn(),
  getParentList: vi.fn(),
  isListItemEmpty: vi.fn(),
  isListSingleItem: vi.fn(),
}));

describe('PanelListPlugin command handling', () => {
  const handlers = new Map<string, (...args: unknown[]) => unknown>();
  const editor = {
    registerCommand: vi.fn(
      (command: string, handler: (...args: unknown[]) => unknown) => {
        handlers.set(command, handler);
        return vi.fn();
      },
    ),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    handlers.clear();
    (useLexicalComposerContext as Mock).mockReturnValue([editor]);
    render(<PanelListPlugin />);
  });

  it('replaces a single empty list item inside a panel with a paragraph', () => {
    const paragraph = { select: vi.fn() };
    const listNode = { replace: vi.fn() };
    const listItem = { remove: vi.fn() };
    const selection = {
      isCollapsed: () => true,
      anchor: {
        getNode: () => ({ id: 'anchor' }),
      },
    };

    ($createParagraphNode as Mock).mockReturnValue(paragraph);
    ($getSelection as Mock).mockReturnValue(selection);
    ($isRangeSelection as Mock).mockReturnValue(true);
    ($isInsidePanel as Mock).mockReturnValue(true);
    ($findParentListItem as Mock).mockReturnValue(listItem);
    (isListItemEmpty as Mock).mockReturnValue(true);
    (getParentList as Mock).mockReturnValue(listNode);
    (isListSingleItem as Mock).mockReturnValue(true);

    const preventDefault = vi.fn();
    const handled = handlers.get('KEY_ENTER_COMMAND')?.({ preventDefault });

    expect(handled).toBe(true);
    expect(preventDefault).toHaveBeenCalled();
    expect(listNode.replace).toHaveBeenCalledWith(paragraph);
    expect(paragraph.select).toHaveBeenCalled();
  });

  it('removes an empty list item and inserts a paragraph after a multi-item list', () => {
    const paragraph = { select: vi.fn() };
    const listNode = { insertAfter: vi.fn() };
    const listItem = { remove: vi.fn() };
    const selection = {
      isCollapsed: () => true,
      anchor: {
        getNode: () => ({ id: 'anchor' }),
      },
    };

    ($createParagraphNode as Mock).mockReturnValue(paragraph);
    ($getSelection as Mock).mockReturnValue(selection);
    ($isRangeSelection as Mock).mockReturnValue(true);
    ($isInsidePanel as Mock).mockReturnValue(true);
    ($findParentListItem as Mock).mockReturnValue(listItem);
    (isListItemEmpty as Mock).mockReturnValue(true);
    (getParentList as Mock).mockReturnValue(listNode);
    (isListSingleItem as Mock).mockReturnValue(false);

    const handled = handlers.get('KEY_ENTER_COMMAND')?.({
      preventDefault: vi.fn(),
    });

    expect(handled).toBe(true);
    expect(listItem.remove).toHaveBeenCalled();
    expect(listNode.insertAfter).toHaveBeenCalledWith(paragraph);
    expect(paragraph.select).toHaveBeenCalled();
  });

  it('wraps selected nodes in a bullet list when inside a panel', () => {
    const parent = { replace: vi.fn() };
    const insideNode = { getParent: () => parent };
    const outsideNode = { getParent: () => ({}) };
    const listNode = { append: vi.fn() };
    const listItemNode = { append: vi.fn(), selectEnd: vi.fn() };
    const selection = {
      anchor: {
        getNode: () => ({ getParent: () => parent }),
      },
      getNodes: () => [insideNode, outsideNode],
    };

    ($getSelection as Mock).mockReturnValue(selection);
    ($isRangeSelection as Mock).mockReturnValue(true);
    ($isInsidePanel as Mock).mockReturnValue(true);
    ($isListItemNode as Mock).mockReturnValue(false);
    ($isListNode as Mock).mockReturnValue(false);
    ($createListNode as Mock).mockReturnValue(listNode);
    ($createListItemNode as Mock).mockReturnValue(listItemNode);

    const handled = handlers.get(INSERT_UNORDERED_LIST_COMMAND)?.();

    expect(handled).toBe(true);
    expect($createListNode).toHaveBeenCalledWith('bullet');
    expect(listItemNode.append).toHaveBeenCalledWith(insideNode);
    expect(listItemNode.append).not.toHaveBeenCalledWith(outsideNode);
    expect(listNode.append).toHaveBeenCalledWith(listItemNode);
    expect(parent.replace).toHaveBeenCalledWith(listNode);
    expect(listItemNode.selectEnd).toHaveBeenCalled();
  });

  it('wraps selected nodes in a numbered list when inside a panel', () => {
    const parent = { replace: vi.fn() };
    const selectedNode = { getParent: () => parent };
    const listNode = { append: vi.fn() };
    const listItemNode = { append: vi.fn(), selectEnd: vi.fn() };
    const selection = {
      anchor: {
        getNode: () => ({ getParent: () => parent }),
      },
      getNodes: () => [selectedNode],
    };

    ($getSelection as Mock).mockReturnValue(selection);
    ($isRangeSelection as Mock).mockReturnValue(true);
    ($isInsidePanel as Mock).mockReturnValue(true);
    ($isListItemNode as Mock).mockReturnValue(false);
    ($isListNode as Mock).mockReturnValue(false);
    ($createListNode as Mock).mockReturnValue(listNode);
    ($createListItemNode as Mock).mockReturnValue(listItemNode);

    const handled = handlers.get(INSERT_ORDERED_LIST_COMMAND)?.();

    expect(handled).toBe(true);
    expect($createListNode).toHaveBeenCalledWith('number');
    expect(listItemNode.append).toHaveBeenCalledWith(selectedNode);
    expect(listNode.append).toHaveBeenCalledWith(listItemNode);
    expect(parent.replace).toHaveBeenCalledWith(listNode);
    expect(listItemNode.selectEnd).toHaveBeenCalled();
  });

  it('returns false when list handling should fall back to default behavior', () => {
    ($getSelection as Mock).mockReturnValue({
      isCollapsed: () => false,
      anchor: {
        getNode: () => ({ getParent: () => null }),
      },
      getNodes: () => [],
    });
    ($isRangeSelection as Mock).mockReturnValue(false);
    ($isInsidePanel as Mock).mockReturnValue(false);

    expect(
      handlers.get('KEY_ENTER_COMMAND')?.({ preventDefault: vi.fn() }),
    ).toBe(false);
    expect(handlers.get(INSERT_UNORDERED_LIST_COMMAND)?.()).toBe(false);
    expect(handlers.get(INSERT_ORDERED_LIST_COMMAND)?.()).toBe(false);
  });
});
