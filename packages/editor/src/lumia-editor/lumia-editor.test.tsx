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

  it('renders full toolbar when variant is full', () => {
    render(<LumiaEditor value={mockDoc} onChange={() => {}} variant="full" />);
    expect(screen.getByTitle('Bold')).toBeInTheDocument();
    expect(screen.getByTitle('Italic')).toBeInTheDocument();
    expect(screen.getByTitle('Bullet List')).toBeInTheDocument();
    expect(screen.getByTitle('Link')).toBeInTheDocument();
    // Check for Select by finding the option or combobox
    expect(screen.getByText('Paragraph')).toBeInTheDocument();
  });

  it('renders compact toolbar when variant is compact', () => {
    render(
      <LumiaEditor value={mockDoc} onChange={() => {}} variant="compact" />,
    );
    expect(screen.getByTitle('Bold')).toBeInTheDocument();
    expect(screen.getByTitle('Italic')).toBeInTheDocument();
    expect(screen.getByTitle('Link')).toBeInTheDocument();

    // Should NOT be present
    expect(screen.queryByTitle('Bullet List')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Ordered List')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Underline')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Code')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Align Left')).not.toBeInTheDocument();
  });

  it('toggles bold mark when bold button is clicked', () => {
    const handleChange = vi.fn();
    render(
      <LumiaEditor value={mockDoc} onChange={handleChange} variant="full" />,
    );

    const boldButton = screen.getByTitle('Bold');
    fireEvent.click(boldButton);

    const expectedDoc = JSON.parse(JSON.stringify(mockDoc));
    expectedDoc.content[0].content[0].marks = [{ type: 'bold' }];

    expect(handleChange).toHaveBeenCalledWith(expectedDoc);
  });

  it('updates block type when heading is selected', () => {
    const handleChange = vi.fn();
    render(
      <LumiaEditor value={mockDoc} onChange={handleChange} variant="full" />,
    );

    const select = screen.getByRole('combobox'); // Assuming Select renders as a native select or similar accessible role
    fireEvent.change(select, { target: { value: 'heading1' } });

    const expectedDoc = JSON.parse(JSON.stringify(mockDoc));
    expectedDoc.content[0].type = 'heading';
    expectedDoc.content[0].attrs = { level: 1 };

    expect(handleChange).toHaveBeenCalledWith(expectedDoc);
  });
});
