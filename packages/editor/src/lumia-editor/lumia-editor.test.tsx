import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LumiaEditor } from './lumia-editor';
import { DocNode } from '../schema/docSchema';

const mockDoc: DocNode = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Hello World',
        },
      ],
    },
  ],
};

describe('LumiaEditor', () => {
  it('renders without crashing given a basic value', () => {
    render(<LumiaEditor value={mockDoc} onChange={() => {}} />);
    expect(screen.getByTestId('lumia-editor-input')).toBeInTheDocument();
    expect(
      (screen.getByTestId('lumia-editor-input') as HTMLTextAreaElement).value,
    ).toBe(JSON.stringify(mockDoc, null, 2));
  });

  it('triggers onChange with updated JSON when typing', () => {
    const handleChange = vi.fn();
    render(<LumiaEditor value={mockDoc} onChange={handleChange} />);

    const input = screen.getByTestId('lumia-editor-input');
    const newDoc = { ...mockDoc, content: [] };

    fireEvent.change(input, { target: { value: JSON.stringify(newDoc) } });

    expect(handleChange).toHaveBeenCalledWith(newDoc);
  });

  it('respects readOnly prop', () => {
    render(<LumiaEditor value={mockDoc} onChange={() => {}} readOnly={true} />);
    expect(screen.queryByTestId('lumia-editor-input')).not.toBeInTheDocument();
    expect(screen.getByTestId('lumia-editor-readonly-view').textContent).toBe(
      JSON.stringify(mockDoc, null, 2),
    );
  });
});
