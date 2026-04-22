import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { InlineToolbar } from './InlineToolbar';
import { vi, describe, beforeEach, it, expect, Mock } from 'vitest';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';

// Mock dependencies
vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: vi.fn(),
}));

vi.mock('lexical', () => ({
  $getSelection: vi.fn(() => null),
  $isRangeSelection: vi.fn(() => false),
  FORMAT_TEXT_COMMAND: Symbol('FORMAT_TEXT_COMMAND'),
  SELECTION_CHANGE_COMMAND: Symbol('SELECTION_CHANGE_COMMAND'),
}));

vi.mock('@lexical/utils', () => ({
  mergeRegister: vi.fn((...callbacks: (() => void)[]) => () => {
    callbacks.forEach((cb) => {
      if (typeof cb === 'function') cb();
    });
  }),
}));

vi.mock('@lumia-ui/components', () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Toolbar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="inline-toolbar">{children}</div>
  ),
}));

describe('InlineToolbar', () => {
  const mockRegisterUpdateListener = vi.fn(() => vi.fn());
  const mockRegisterCommand = vi.fn(() => vi.fn());
  const mockDispatchCommand = vi.fn();
  const mockEditor = {
    registerUpdateListener: mockRegisterUpdateListener,
    registerCommand: mockRegisterCommand,
    dispatchCommand: mockDispatchCommand,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useLexicalComposerContext as Mock).mockReturnValue([mockEditor]);
    ($getSelection as Mock).mockReturnValue(null);
    ($isRangeSelection as Mock).mockReturnValue(false);
  });

  it('returns null when no selection', () => {
    // Mock window.getSelection to return null
    const originalGetSelection = window.getSelection;
    window.getSelection = vi.fn(() => null) as () => Selection | null;

    const { container } = render(<InlineToolbar />);
    // The portal renders nothing when display is 'none'
    expect(container.firstChild).toBeNull();

    window.getSelection = originalGetSelection;
  });

  it('registers update listener on mount', () => {
    const originalGetSelection = window.getSelection;
    window.getSelection = vi.fn(() => null) as () => Selection | null;

    render(<InlineToolbar />);
    expect(mockRegisterUpdateListener).toHaveBeenCalled();

    window.getSelection = originalGetSelection;
  });

  it('registers selection change command', () => {
    const originalGetSelection = window.getSelection;
    window.getSelection = vi.fn(() => null) as () => Selection | null;

    render(<InlineToolbar />);
    expect(mockRegisterCommand).toHaveBeenCalled();

    window.getSelection = originalGetSelection;
  });

  it('shows the floating toolbar for a non-collapsed DOM selection and dispatches format commands', () => {
    const originalGetSelection = window.getSelection;
    window.getSelection = vi.fn(() => ({
      isCollapsed: false,
      getRangeAt: () => ({
        getBoundingClientRect: () => ({ top: 100, left: 50 }),
      }),
    })) as () => Selection | null;
    ($getSelection as Mock).mockReturnValue({
      hasFormat: (format: string) => format === 'bold',
    });
    ($isRangeSelection as Mock).mockReturnValue(true);

    render(<InlineToolbar />);

    const updateListener = mockRegisterUpdateListener.mock
      .calls[0][0] as (payload: {
      editorState: { read: (callback: () => void) => void };
    }) => void;
    act(() => {
      updateListener({
        editorState: {
          read: (callback) => callback(),
        },
      });
    });

    const selectionCommand = mockRegisterCommand.mock.calls.find(
      (call) => call[0] === SELECTION_CHANGE_COMMAND,
    );
    expect(selectionCommand).toBeDefined();

    act(() => {
      document.dispatchEvent(new Event('selectionchange'));
    });

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);

    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);

    expect(mockDispatchCommand).toHaveBeenNthCalledWith(
      1,
      FORMAT_TEXT_COMMAND,
      'bold',
    );
    expect(mockDispatchCommand).toHaveBeenNthCalledWith(
      2,
      FORMAT_TEXT_COMMAND,
      'italic',
    );

    window.getSelection = originalGetSelection;
  });
});
