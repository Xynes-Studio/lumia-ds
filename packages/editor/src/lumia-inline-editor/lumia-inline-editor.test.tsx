import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LumiaInlineEditor } from './lumia-inline-editor';
import { DocNode } from '../schema/docSchema';

const mockDoc: DocNode = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Hello Inline World',
        },
      ],
    },
  ],
};

describe('LumiaInlineEditor', () => {
  it('renders in view mode initially', () => {
    render(<LumiaInlineEditor value={mockDoc} onChange={() => {}} />);
    expect(
      screen.getByTestId('lumia-inline-editor-view-mode'),
    ).toBeInTheDocument();
    expect(screen.getByText('Hello Inline World')).toBeInTheDocument();
    expect(
      screen.queryByTestId('lumia-inline-editor-edit-mode'),
    ).not.toBeInTheDocument();
  });

  it('switches to edit mode on click', () => {
    render(<LumiaInlineEditor value={mockDoc} onChange={() => {}} />);

    fireEvent.click(screen.getByTestId('lumia-inline-editor-view-mode'));

    expect(
      screen.getByTestId('lumia-inline-editor-edit-mode'),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('lumia-inline-editor-view-mode'),
    ).not.toBeInTheDocument();
  });

  it('switches to edit mode on focus', () => {
    render(<LumiaInlineEditor value={mockDoc} onChange={() => {}} />);

    fireEvent.focus(screen.getByTestId('lumia-inline-editor-view-mode'));

    expect(
      screen.getByTestId('lumia-inline-editor-edit-mode'),
    ).toBeInTheDocument();
  });

  it('calls onChange when editing', () => {
    const handleChange = vi.fn();
    render(<LumiaInlineEditor value={mockDoc} onChange={handleChange} />);

    // Enter edit mode
    fireEvent.click(screen.getByTestId('lumia-inline-editor-view-mode'));

    // Find the textarea from LumiaEditor (it has data-testid="lumia-editor-input")
    const input = screen.getByTestId('lumia-editor-input');

    const newDoc = { ...mockDoc, content: [] };
    fireEvent.change(input, { target: { value: JSON.stringify(newDoc) } });

    expect(handleChange).toHaveBeenCalledWith(newDoc);
  });

  it('switches back to view mode on blur', () => {
    render(<LumiaInlineEditor value={mockDoc} onChange={() => {}} />);

    // Enter edit mode
    fireEvent.click(screen.getByTestId('lumia-inline-editor-view-mode'));
    expect(
      screen.getByTestId('lumia-inline-editor-edit-mode'),
    ).toBeInTheDocument();

    // Blur the wrapper
    fireEvent.blur(screen.getByTestId('lumia-inline-editor-edit-mode'));

    expect(
      screen.getByTestId('lumia-inline-editor-view-mode'),
    ).toBeInTheDocument();
  });

  it('does not switch to view mode if blur is within the editor', () => {
    render(<LumiaInlineEditor value={mockDoc} onChange={() => {}} />);

    // Enter edit mode
    fireEvent.click(screen.getByTestId('lumia-inline-editor-view-mode'));

    const wrapper = screen.getByTestId('lumia-inline-editor-edit-mode');
    const input = screen.getByTestId('lumia-editor-input');

    // Focus input (should be already focused but simulate it)
    input.focus();

    // Blur input, but related target is the wrapper (simulating click on toolbar inside wrapper)
    fireEvent.blur(wrapper, { relatedTarget: input });

    // Should still be in edit mode
    expect(
      screen.getByTestId('lumia-inline-editor-edit-mode'),
    ).toBeInTheDocument();
  });
});
