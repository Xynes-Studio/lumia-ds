import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { SlashMenuPlugin } from './SlashMenuPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getNodeByKey,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
} from 'lexical';
import { useSlashMenuState } from '../hooks/useSlashMenuState';
import { filterSlashCommands } from '../components/SlashMenu';

vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: vi.fn(),
}));

vi.mock('lexical', () => ({
  $getSelection: vi.fn(),
  $isRangeSelection: vi.fn(),
  $getNodeByKey: vi.fn(),
  $isTextNode: vi.fn(),
  $isElementNode: vi.fn(),
}));

vi.mock('../EditorProvider', () => ({
  useMediaContext: vi.fn(() => null),
}));

vi.mock('../hooks/useSlashMenuKeyboard', () => ({
  useSlashMenuKeyboard: vi.fn(),
}));

vi.mock('../hooks/useSlashMenuQuery', () => ({
  useSlashMenuQuery: vi.fn(),
}));

vi.mock('../hooks/useSlashMediaUpload', () => ({
  useSlashMediaUpload: vi.fn(() => ({
    handleInsertImageFromUrl: vi.fn(),
    handleInsertImageFromFile: vi.fn(),
    handleInsertVideoFromUrl: vi.fn(),
    handleInsertVideoFromFile: vi.fn(),
    handleInsertFileFromUrl: vi.fn(),
    handleInsertFileFromFile: vi.fn(),
  })),
}));

vi.mock('../hooks/useSlashMenuState', () => ({
  useSlashMenuState: vi.fn(),
}));

vi.mock('../components/SlashMenu', () => ({
  SlashMenu: ({
    commands,
    onSelect,
  }: {
    commands: Array<{ label: string }>;
    onSelect: (command: unknown) => void;
  }) => (
    <div data-testid="slash-menu">
      {commands.map((command) => (
        <button key={command.label} onClick={() => onSelect(command)}>
          {command.label}
        </button>
      ))}
    </div>
  ),
  defaultSlashCommands: [],
  filterSlashCommands: vi.fn(),
}));

vi.mock('../components/SlashMenu/SlashMenuModal', () => ({
  SlashMenuModal: ({
    isOpen,
    type,
  }: {
    isOpen: boolean;
    type: string | null;
  }) => (
    <div
      data-testid="slash-menu-modal"
      data-open={isOpen}
      data-type={type ?? ''}
    />
  ),
}));

describe('SlashMenuPlugin unit', () => {
  const mockEditor = {
    update: vi.fn((callback: () => void) => callback()),
  };

  const baseMenuState = {
    isOpen: true,
    query: 'image',
    triggerNodeKey: 'trigger-node',
    triggerOffset: 0,
    position: { top: 12, left: 24 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useLexicalComposerContext as Mock).mockReturnValue([mockEditor]);
    ($getSelection as Mock).mockReturnValue({
      anchor: {
        getNode: () => ({ getParent: () => null }),
      },
    });
    ($isRangeSelection as Mock).mockReturnValue(true);
  });

  it('removes the slash query and opens a modal command', () => {
    const closeMenu = vi.fn();
    const openModal = vi.fn();
    const select = vi.fn();
    const setTextContent = vi.fn();
    const command = {
      name: 'image',
      label: 'Image',
      description: 'Insert image',
      icon: () => null,
      modalType: 'media-image',
      execute: vi.fn(),
    };

    (useSlashMenuState as Mock).mockReturnValue({
      menuState: baseMenuState,
      modalState: { isOpen: false, type: null, position: { top: 0, left: 0 } },
      openMenu: vi.fn(),
      closeMenu,
      updateQuery: vi.fn(),
      openModal,
      closeModal: vi.fn(),
    });
    (filterSlashCommands as Mock).mockReturnValue([command]);
    ($getNodeByKey as Mock).mockReturnValue({
      getTextContent: () => '/image',
      setTextContent,
      select,
    });
    ($isTextNode as Mock).mockReturnValue(true);
    ($isElementNode as Mock).mockReturnValue(false);

    render(<SlashMenuPlugin />);
    fireEvent.click(screen.getByRole('button', { name: 'Image' }));

    expect(setTextContent).toHaveBeenCalledWith('');
    expect(select).toHaveBeenCalled();
    expect(closeMenu).toHaveBeenCalled();
    expect(openModal).toHaveBeenCalledWith('media-image', {
      top: 12,
      left: 24,
    });
    expect(command.execute).not.toHaveBeenCalled();
  });

  it('executes non-modal commands after removing slash content from an element trigger', () => {
    const closeMenu = vi.fn();
    const command = {
      name: 'paragraph',
      label: 'Paragraph',
      description: 'Insert paragraph',
      icon: () => null,
      execute: vi.fn(),
    };
    const setTextContent = vi.fn();
    const childNode = {
      getTextContent: () => '/p next',
      setTextContent,
      select: vi.fn(),
    };
    const elementNode = {
      getFirstChild: () => childNode,
      select: vi.fn(),
    };

    (useSlashMenuState as Mock).mockReturnValue({
      menuState: { ...baseMenuState, query: 'p', triggerOffset: 3 },
      modalState: { isOpen: false, type: null, position: { top: 0, left: 0 } },
      openMenu: vi.fn(),
      closeMenu,
      updateQuery: vi.fn(),
      openModal: vi.fn(),
      closeModal: vi.fn(),
    });
    (filterSlashCommands as Mock).mockReturnValue([command]);
    ($getNodeByKey as Mock).mockReturnValue(elementNode);
    ($isElementNode as Mock).mockImplementation(
      (node: unknown) => node === elementNode,
    );
    ($isTextNode as Mock).mockImplementation(
      (node: unknown) => node === childNode,
    );

    render(<SlashMenuPlugin />);
    fireEvent.click(screen.getByRole('button', { name: 'Paragraph' }));

    expect(setTextContent).toHaveBeenCalledWith(' next');
    expect(closeMenu).toHaveBeenCalled();
    expect(command.execute).toHaveBeenCalledWith(mockEditor);
  });
});
