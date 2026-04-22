/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LumiaInlineEditorPrimitive } from './LumiaInlineEditorPrimitive';

const mockEditorFocus = vi.fn();

vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: () => [{ focus: mockEditorFocus }],
}));

vi.mock('@lexical/react/LexicalRichTextPlugin', () => ({
  RichTextPlugin: ({ placeholder, contentEditable }: any) => (
    <div data-testid="rich-text-plugin">
      <button data-testid="interactive-target" type="button">
        Keep focus
      </button>
      {contentEditable}
      {placeholder}
    </div>
  ),
}));

vi.mock('@lexical/react/LexicalContentEditable', () => ({
  ContentEditable: ({ className, 'aria-label': ariaLabel, ...props }: any) => (
    <div
      data-testid="content-editable"
      className={className}
      aria-label={ariaLabel}
      contentEditable
      {...props}
    />
  ),
}));

vi.mock('@lexical/react/LexicalHistoryPlugin', () => ({
  HistoryPlugin: () => <div data-testid="history-plugin" />,
}));

vi.mock('@lexical/react/LexicalLinkPlugin', () => ({
  LinkPlugin: () => <div data-testid="link-plugin" />,
}));

vi.mock('./ClickableLinkPlugin', () => ({
  ClickableLinkPlugin: () => <div data-testid="clickable-link-plugin" />,
}));

vi.mock('./PasteLinkPlugin', () => ({
  PasteLinkPlugin: () => <div data-testid="paste-link-plugin" />,
}));

vi.mock('./InlineToolbar', () => ({
  InlineToolbar: () => <div data-testid="inline-toolbar" />,
}));

describe('LumiaInlineEditorPrimitive', () => {
  beforeEach(() => {
    mockEditorFocus.mockClear();
  });

  it('renders the inline editor shell and plugins', () => {
    const { container } = render(
      <LumiaInlineEditorPrimitive className="custom-inline" />,
    );

    expect(container.firstChild).toHaveClass('editor-container--inline');
    expect(container.firstChild).toHaveClass('custom-inline');
    expect(screen.getByTestId('rich-text-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('history-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('link-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('clickable-link-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('paste-link-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('inline-toolbar')).toBeInTheDocument();
  });

  it('focuses the editor when the empty inline surface is clicked', () => {
    const { container } = render(<LumiaInlineEditorPrimitive />);
    const wrapper = container.querySelector('.editor-input-wrapper');

    expect(wrapper).not.toBeNull();

    fireEvent.mouseDown(wrapper as Element);

    expect(mockEditorFocus).toHaveBeenCalledTimes(1);
  });

  it('does not steal focus when the contenteditable surface handles the event', () => {
    render(<LumiaInlineEditorPrimitive />);

    fireEvent.mouseDown(screen.getByTestId('interactive-target'));

    expect(mockEditorFocus).not.toHaveBeenCalled();
  });

  it('adds a focused wrapper state while the inline editor surface is focused', () => {
    const { container } = render(<LumiaInlineEditorPrimitive />);
    const wrapper = container.querySelector('.editor-input-wrapper');
    const input = screen.getByTestId('content-editable');

    expect(wrapper).not.toBeNull();
    expect(wrapper).not.toHaveClass('editor-input-wrapper--focused');

    fireEvent.focus(input);

    expect(wrapper).toHaveClass('editor-input-wrapper--focused');

    fireEvent.blur(input);

    expect(wrapper).not.toHaveClass('editor-input-wrapper--focused');
  });
});
