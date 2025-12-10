import React from 'react';
import { render } from '@testing-library/react';
import { CodeHighlightPlugin } from './CodeHighlightPlugin';
import { vi, describe, beforeEach, it, expect, Mock } from 'vitest';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { registerCodeHighlighting } from '@lexical/code';

// Mock dependencies
vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: vi.fn(),
}));

vi.mock('@lexical/code', () => ({
  registerCodeHighlighting: vi.fn(() => vi.fn()),
}));

describe('CodeHighlightPlugin', () => {
  const mockEditor = {
    registerUpdateListener: vi.fn(() => vi.fn()),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useLexicalComposerContext as Mock).mockReturnValue([mockEditor]);
  });

  it('returns null (no visible UI)', () => {
    const { container } = render(<CodeHighlightPlugin />);
    expect(container.firstChild).toBeNull();
  });

  it('registers code highlighting on mount', () => {
    render(<CodeHighlightPlugin />);
    expect(registerCodeHighlighting).toHaveBeenCalledWith(mockEditor);
  });

  it('unregisters on unmount', () => {
    const mockUnregister = vi.fn();
    (registerCodeHighlighting as Mock).mockReturnValue(mockUnregister);

    const { unmount } = render(<CodeHighlightPlugin />);
    unmount();

    expect(mockUnregister).toHaveBeenCalled();
  });
});
