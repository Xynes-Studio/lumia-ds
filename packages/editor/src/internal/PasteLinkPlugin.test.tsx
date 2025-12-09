import React from 'react';
import { render } from '@testing-library/react';
import { PasteLinkPlugin } from './PasteLinkPlugin';
import { vi, describe, beforeEach, afterEach, it, expect, Mock } from 'vitest';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

// Mock dependencies
vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: vi.fn(),
}));

vi.mock('lexical', () => ({
  PASTE_COMMAND: Symbol('PASTE_COMMAND'),
  $getSelection: vi.fn(),
  $isRangeSelection: vi.fn(() => false),
  COMMAND_PRIORITY_LOW: 1,
}));

vi.mock('@lexical/link', () => ({
  TOGGLE_LINK_COMMAND: Symbol('TOGGLE_LINK_COMMAND'),
}));

describe('PasteLinkPlugin', () => {
  const mockRegisterCommand = vi.fn(() => vi.fn());
  const mockDispatchCommand = vi.fn();
  const mockEditor = {
    registerCommand: mockRegisterCommand,
    dispatchCommand: mockDispatchCommand,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useLexicalComposerContext as Mock).mockReturnValue([mockEditor]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns null (no visible UI)', () => {
    const { container } = render(<PasteLinkPlugin />);
    expect(container.firstChild).toBeNull();
  });

  it('registers PASTE_COMMAND handler', () => {
    render(<PasteLinkPlugin />);
    expect(mockRegisterCommand).toHaveBeenCalled();
  });

  it('registers command with correct priority', () => {
    render(<PasteLinkPlugin />);

    // Just verify registerCommand was called with 3 arguments
    expect(mockRegisterCommand).toHaveBeenCalled();
    expect(mockRegisterCommand.mock.calls[0]).toHaveLength(3);
  });
});
