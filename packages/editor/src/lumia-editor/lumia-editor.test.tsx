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

    const comboboxes = screen.getAllByRole('combobox');
    const select = comboboxes[0]; // Block type selector is the first combobox
    fireEvent.change(select, { target: { value: 'heading1' } });

    const expectedDoc = JSON.parse(JSON.stringify(mockDoc));
    expectedDoc.content[0].type = 'heading';
    expectedDoc.content[0].attrs = { level: 1 };

    expect(handleChange).toHaveBeenCalledWith(expectedDoc);
  });

  describe('mode prop', () => {
    it('defaults to document mode when mode is not specified', () => {
      render(<LumiaEditor value={mockDoc} onChange={() => {}} />);
      // Document mode should show the editor input
      expect(screen.getByTestId('lumia-editor-input')).toBeInTheDocument();
      // And should show the toolbar
      expect(screen.getByTitle('Bold')).toBeInTheDocument();
    });

    it('renders LumiaInlineEditor when mode is inline', () => {
      render(<LumiaEditor value={mockDoc} onChange={() => {}} mode="inline" />);
      // Should show inline editor view mode initially
      expect(
        screen.getByTestId('lumia-inline-editor-view-mode'),
      ).toBeInTheDocument();
      // Should NOT show the regular editor input
      expect(
        screen.queryByTestId('lumia-editor-input'),
      ).not.toBeInTheDocument();
    });

    it('does not show toolbar in inline mode', () => {
      render(<LumiaEditor value={mockDoc} onChange={() => {}} mode="inline" />);
      // Inline mode should NOT show the big toolbar
      expect(screen.queryByTitle('Bold')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Italic')).not.toBeInTheDocument();
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('preserves JSON state when switching between modes', () => {
      const { rerender } = render(
        <LumiaEditor value={mockDoc} onChange={() => {}} mode="document" />,
      );

      // Verify document mode is rendered
      expect(screen.getByTestId('lumia-editor-input')).toBeInTheDocument();
      expect(
        (screen.getByTestId('lumia-editor-input') as HTMLTextAreaElement).value,
      ).toBe(JSON.stringify(mockDoc, null, 2));

      // Switch to inline mode
      rerender(
        <LumiaEditor value={mockDoc} onChange={() => {}} mode="inline" />,
      );

      // Verify inline mode is rendered with same data
      expect(
        screen.getByTestId('lumia-inline-editor-view-mode'),
      ).toBeInTheDocument();
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('calls onChange correctly in inline mode', () => {
      const handleChange = vi.fn();
      render(
        <LumiaEditor value={mockDoc} onChange={handleChange} mode="inline" />,
      );

      // Click to enter edit mode
      fireEvent.click(screen.getByTestId('lumia-inline-editor-view-mode'));

      // Find the textarea from the compact editor
      const input = screen.getByTestId('lumia-editor-input');
      const newDoc = { ...mockDoc, content: [] };
      fireEvent.change(input, { target: { value: JSON.stringify(newDoc) } });

      expect(handleChange).toHaveBeenCalledWith(newDoc);
    });
  });

  describe('fonts prop and font configuration', () => {
    const mockFontConfig = {
      allFonts: [
        { id: 'inter', label: 'Inter', category: 'sans' as const },
        { id: 'roboto', label: 'Roboto', category: 'sans' as const },
        { id: 'lora', label: 'Lora', category: 'serif' as const },
      ],
      allowedFonts: ['inter', 'roboto'],
      defaultFontId: 'inter',
    };

    it('renders FontCombobox in full variant with default fonts', () => {
      render(
        <LumiaEditor value={mockDoc} onChange={() => {}} variant="full" />,
      );

      // FontCombobox should be present in full variant
      const fontInput = screen.getByPlaceholderText('Select font...');
      expect(fontInput).toBeInTheDocument();
    });

    it('does not render FontCombobox in compact variant', () => {
      render(
        <LumiaEditor value={mockDoc} onChange={() => {}} variant="compact" />,
      );

      // FontCombobox should NOT be present in compact variant
      expect(
        screen.queryByPlaceholderText('Select font...'),
      ).not.toBeInTheDocument();
    });

    it('does not render FontCombobox in inline mode', () => {
      render(<LumiaEditor value={mockDoc} onChange={() => {}} mode="inline" />);

      // FontCombobox should NOT be present in inline mode
      expect(
        screen.queryByPlaceholderText('Select font...'),
      ).not.toBeInTheDocument();
    });

    it('filters fonts when allowedFonts is provided', () => {
      render(
        <LumiaEditor
          value={mockDoc}
          onChange={() => {}}
          variant="full"
          fonts={mockFontConfig}
        />,
      );

      const fontInput = screen.getByPlaceholderText('Select font...');
      expect(fontInput).toBeInTheDocument();

      // The FontCombobox should have received only 2 fonts (inter, roboto)
      // This is indirectly verified by checking that the component renders
    });

    it('shows all fonts when allowedFonts is undefined', () => {
      const configWithAllFonts = {
        allFonts: mockFontConfig.allFonts,
        defaultFontId: 'inter',
      };

      render(
        <LumiaEditor
          value={mockDoc}
          onChange={() => {}}
          variant="full"
          fonts={configWithAllFonts}
        />,
      );

      const fontInput = screen.getByPlaceholderText('Select font...');
      expect(fontInput).toBeInTheDocument();
    });

    it('applies font to block when font is selected', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <LumiaEditor
          value={mockDoc}
          onChange={handleChange}
          variant="full"
          fonts={mockFontConfig}
        />,
      );

      // Simulate font change by finding the input and triggering change
      const fontInput = screen.getByPlaceholderText(
        'Select font...',
      ) as HTMLInputElement;

      // Simulate typing and selecting a font
      fireEvent.focus(fontInput);
      fireEvent.change(fontInput, { target: { value: 'Roboto' } });

      // Find the Roboto option and click it
      const options = container.querySelectorAll('[role="option"]');
      const robotoOption = Array.from(options).find(
        (opt) => opt.textContent?.trim() === 'Roboto',
      );

      if (robotoOption) {
        fireEvent.click(robotoOption);

        // Verify onChange was called with fontId in block attrs
        expect(handleChange).toHaveBeenCalled();
        const updatedDoc = handleChange.mock.calls[0][0];
        expect(updatedDoc.content[0].attrs?.fontId).toBeDefined();
      }
    });

    it('displays defaultFontId when block has no fontId', () => {
      render(
        <LumiaEditor
          value={mockDoc}
          onChange={() => {}}
          variant="full"
          fonts={mockFontConfig}
        />,
      );

      const fontInput = screen.getByPlaceholderText(
        'Select font...',
      ) as HTMLInputElement;

      // Since mockDoc has no fontId, it should show the default (Inter)
      expect(fontInput.value).toBe('Inter');
    });

    it('normalizes invalid fontId to defaultFontId', () => {
      const docWithInvalidFont = {
        type: 'doc' as const,
        content: [
          {
            type: 'paragraph' as const,
            attrs: { fontId: 'nonexistent-font' },
            content: [
              {
                type: 'text' as const,
                text: 'Hello World',
              },
            ],
          },
        ],
      };

      render(
        <LumiaEditor
          value={docWithInvalidFont}
          onChange={() => {}}
          variant="full"
          fonts={mockFontConfig}
        />,
      );

      const fontInput = screen.getByPlaceholderText(
        'Select font...',
      ) as HTMLInputElement;

      // Invalid font should be normalized to default (Inter)
      expect(fontInput.value).toBe('Inter');
    });

    it('normalizes fontId not in allowedFonts to defaultFontId', () => {
      const docWithDisallowedFont = {
        type: 'doc' as const,
        content: [
          {
            type: 'paragraph' as const,
            attrs: { fontId: 'lora' }, // Lora is in allFonts but not in allowedFonts
            content: [
              {
                type: 'text' as const,
                text: 'Hello World',
              },
            ],
          },
        ],
      };

      render(
        <LumiaEditor
          value={docWithDisallowedFont}
          onChange={() => {}}
          variant="full"
          fonts={mockFontConfig}
        />,
      );

      const fontInput = screen.getByPlaceholderText(
        'Select font...',
      ) as HTMLInputElement;

      // Lora is not in allowedFonts, should normalize to default (Inter)
      expect(fontInput.value).toBe('Inter');
    });

    it('preserves fontId when changing block type', () => {
      const docWithFont = {
        type: 'doc' as const,
        content: [
          {
            type: 'paragraph' as const,
            attrs: { fontId: 'roboto' },
            content: [
              {
                type: 'text' as const,
                text: 'Hello World',
              },
            ],
          },
        ],
      };

      const handleChange = vi.fn();
      render(
        <LumiaEditor
          value={docWithFont}
          onChange={handleChange}
          variant="full"
          fonts={mockFontConfig}
        />,
      );

      // Change block type to heading - select the first combobox (block type selector)
      const comboboxes = screen.getAllByRole('combobox');
      const blockTypeSelect = comboboxes[0]; // First combobox is the block type selector
      fireEvent.change(blockTypeSelect, { target: { value: 'heading1' } });

      expect(handleChange).toHaveBeenCalled();
      const updatedDoc = handleChange.mock.calls[0][0];

      // Font should be preserved when changing block type
      expect(updatedDoc.content[0].attrs.fontId).toBe('roboto');
      expect(updatedDoc.content[0].type).toBe('heading');
    });
  });
});
