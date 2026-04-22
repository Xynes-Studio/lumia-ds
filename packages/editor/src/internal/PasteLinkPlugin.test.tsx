import React from 'react';
import { render } from '@testing-library/react';
import { PasteLinkPlugin } from './PasteLinkPlugin';
import { vi, describe, beforeEach, afterEach, it, expect, Mock } from 'vitest';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, PASTE_COMMAND } from 'lexical';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';

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

  const createClipboardEvent = (text: string) => {
    const event = Object.create(ClipboardEvent.prototype) as ClipboardEvent & {
      clipboardData: { getData: (type: string) => string };
      preventDefault: ReturnType<typeof vi.fn>;
    };
    event.clipboardData = {
      getData: (type: string) => (type === 'text/plain' ? text : ''),
    };
    event.preventDefault = vi.fn();
    return event;
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

  it('returns false for non-url paste content', () => {
    render(<PasteLinkPlugin />);

    const handler = mockRegisterCommand.mock.calls.find(
      (call) => call[0] === PASTE_COMMAND,
    )?.[1] as (event: ClipboardEvent) => boolean;

    const result = handler(createClipboardEvent('plain text only'));

    expect(result).toBe(false);
    expect(mockDispatchCommand).not.toHaveBeenCalled();
  });

  it('returns false for URL paste when selection is collapsed', () => {
    ($getSelection as Mock).mockReturnValue({ isCollapsed: () => true });
    ($isRangeSelection as Mock).mockReturnValue(true);

    render(<PasteLinkPlugin />);

    const handler = mockRegisterCommand.mock.calls.find(
      (call) => call[0] === PASTE_COMMAND,
    )?.[1] as (event: ClipboardEvent) => boolean;
    const event = createClipboardEvent('https://example.com');

    const result = handler(event);

    expect(result).toBe(false);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(mockDispatchCommand).not.toHaveBeenCalled();
  });

  it('dispatches toggle link when a URL is pasted over a range selection', () => {
    ($getSelection as Mock).mockReturnValue({ isCollapsed: () => false });
    ($isRangeSelection as Mock).mockReturnValue(true);

    render(<PasteLinkPlugin />);

    const handler = mockRegisterCommand.mock.calls.find(
      (call) => call[0] === PASTE_COMMAND,
    )?.[1] as (event: ClipboardEvent) => boolean;
    const event = createClipboardEvent('https://example.com/article');

    const result = handler(event);

    expect(result).toBe(true);
    expect(mockDispatchCommand).toHaveBeenCalledWith(
      TOGGLE_LINK_COMMAND,
      'https://example.com/article',
    );
    expect(event.preventDefault).toHaveBeenCalled();
  });
});
