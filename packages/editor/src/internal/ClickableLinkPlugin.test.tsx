import React from 'react';
import { render, act } from '@testing-library/react';
import { ClickableLinkPlugin } from './ClickableLinkPlugin';
import { vi, describe, beforeEach, afterEach, it, expect, Mock } from 'vitest';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

// Mock dependencies
vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: vi.fn(),
}));

vi.mock('lexical', () => ({
  CLICK_COMMAND: Symbol('CLICK_COMMAND'),
  $getNearestNodeFromDOMNode: vi.fn(() => null),
}));

vi.mock('@lexical/link', () => ({
  $isLinkNode: vi.fn(() => false),
}));

describe('ClickableLinkPlugin', () => {
  const mockRootElement = document.createElement('div');
  const mockRegisterCommand = vi.fn(() => vi.fn());
  const mockEditor = {
    getRootElement: vi.fn(() => mockRootElement),
    registerCommand: mockRegisterCommand,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useLexicalComposerContext as Mock).mockReturnValue([mockEditor]);
    mockRootElement.classList.remove('cmd-pressed');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns null (no visible UI)', () => {
    const { container } = render(<ClickableLinkPlugin />);
    expect(container.firstChild).toBeNull();
  });

  it('registers CLICK_COMMAND handler', () => {
    render(<ClickableLinkPlugin />);
    expect(mockRegisterCommand).toHaveBeenCalled();
  });

  it('adds cmd-pressed class on Meta keydown', () => {
    render(<ClickableLinkPlugin />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Meta' }));
    });

    expect(mockRootElement.classList.contains('cmd-pressed')).toBe(true);
  });

  it('adds cmd-pressed class on Control keydown', () => {
    render(<ClickableLinkPlugin />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
    });

    expect(mockRootElement.classList.contains('cmd-pressed')).toBe(true);
  });

  it('removes cmd-pressed class on Meta keyup', () => {
    render(<ClickableLinkPlugin />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Meta' }));
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Meta' }));
    });

    expect(mockRootElement.classList.contains('cmd-pressed')).toBe(false);
  });

  it('removes cmd-pressed class on Control keyup', () => {
    render(<ClickableLinkPlugin />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Control' }));
    });

    expect(mockRootElement.classList.contains('cmd-pressed')).toBe(false);
  });

  it('does not add class for other keys', () => {
    render(<ClickableLinkPlugin />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift' }));
    });

    expect(mockRootElement.classList.contains('cmd-pressed')).toBe(false);
  });
});
