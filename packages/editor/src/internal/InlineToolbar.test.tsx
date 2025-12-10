import React from 'react';
import { render } from '@testing-library/react';
import { InlineToolbar } from './InlineToolbar';
import { vi, describe, beforeEach, it, expect, Mock } from 'vitest';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

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

vi.mock('@lumia/components', () => ({
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
});
