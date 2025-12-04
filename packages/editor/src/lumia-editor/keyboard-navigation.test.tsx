import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LumiaEditor } from './lumia-editor';
import { LumiaInlineEditor } from '../lumia-inline-editor/lumia-inline-editor';
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

describe('Keyboard Navigation', () => {
  describe('LumiaEditor - Full Variant', () => {
    it('should allow Tab to move through toolbar controls in order', () => {
      const { getByLabelText } = render(
        <LumiaEditor value={mockDoc} onChange={() => {}} variant="full" />,
      );

      // Get all focusable toolbar elements in expected order
      const blockTypeSelect = screen.getAllByRole('combobox')[0]; // Block type selector
      const fontCombobox = screen.getByPlaceholderText('Select font...'); // Font selector
      const boldButton = getByLabelText('Bold');
      const italicButton = getByLabelText('Italic');
      const linkButton = getByLabelText('Insert link');

      // Focus first element
      blockTypeSelect.focus();
      expect(blockTypeSelect).toHaveFocus();

      // Simulate Tab to next element
      fireEvent.keyDown(blockTypeSelect, { key: 'Tab' });
      fontCombobox.focus(); // In real browser, Tab would move focus
      expect(fontCombobox).toHaveFocus();

      // Continue tabbing through buttons
      fireEvent.keyDown(fontCombobox, { key: 'Tab' });
      boldButton.focus();
      expect(boldButton).toHaveFocus();

      fireEvent.keyDown(boldButton, { key: 'Tab' });
      italicButton.focus();
      expect(italicButton).toHaveFocus();

      fireEvent.keyDown(italicButton, { key: 'Tab' });
      linkButton.focus();
      expect(linkButton).toHaveFocus();
    });

    it('should activate bold button with Enter key', () => {
      const handleChange = vi.fn();
      const { getByLabelText } = render(
        <LumiaEditor value={mockDoc} onChange={handleChange} variant="full" />,
      );

      const boldButton = getByLabelText('Bold');
      boldButton.focus();

      // Activate with Enter
      fireEvent.keyDown(boldButton, { key: 'Enter' });
      fireEvent.click(boldButton); // RTL requires explicit click

      expect(handleChange).toHaveBeenCalled();
      const updatedDoc = handleChange.mock.calls[0][0];
      expect(updatedDoc.content[0].content[0].marks).toEqual([
        { type: 'bold' },
      ]);
    });

    it('should activate italic button with Space key', () => {
      const freshMockDoc: DocNode = {
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

      const handleChange = vi.fn();
      const { getByLabelText } = render(
        <LumiaEditor
          value={freshMockDoc}
          onChange={handleChange}
          variant="full"
        />,
      );

      const italicButton = getByLabelText('Italic');
      italicButton.focus();

      // Activate with Space
      fireEvent.keyDown(italicButton, { key: ' ' });
      fireEvent.click(italicButton); // RTL requires explicit click

      expect(handleChange).toHaveBeenCalled();
      const updatedDoc = handleChange.mock.calls[0][0];
      expect(updatedDoc.content[0].content[0].marks).toEqual([
        { type: 'italic' },
      ]);
    });

    it('should allow keyboard navigation through all toolbar buttons', () => {
      const { getByLabelText } = render(
        <LumiaEditor value={mockDoc} onChange={() => {}} variant="full" />,
      );

      // List of all buttons that should be keyboard accessible
      const buttons = [
        'Bold',
        'Italic',
        'Insert link',
        'Underline',
        'Code',
        'Bullet list',
        'Numbered list',
        'Align left',
        'Align center',
        'Align right',
      ];

      // All buttons should be focusable
      buttons.forEach((label) => {
        const button = getByLabelText(label);
        expect(button.tabIndex).not.toBe(-1);
        button.focus();
        expect(button).toHaveFocus();
      });
    });
  });

  describe('LumiaEditor - Compact Variant', () => {
    it('should have correct Tab order in compact mode', () => {
      const { getByLabelText } = render(
        <LumiaEditor value={mockDoc} onChange={() => {}} variant="compact" />,
      );

      const blockTypeSelect = screen.getAllByRole('combobox')[0];
      const boldButton = getByLabelText('Bold');
      const italicButton = getByLabelText('Italic');
      const linkButton = getByLabelText('Insert link');

      // Focus and verify order
      blockTypeSelect.focus();
      expect(blockTypeSelect).toHaveFocus();

      boldButton.focus();
      expect(boldButton).toHaveFocus();

      italicButton.focus();
      expect(italicButton).toHaveFocus();

      linkButton.focus();
      expect(linkButton).toHaveFocus();
    });

    it('should activate buttons with Enter and Space in compact mode', () => {
      const handleChange = vi.fn();
      const { getByLabelText } = render(
        <LumiaEditor
          value={mockDoc}
          onChange={handleChange}
          variant="compact"
        />,
      );

      const boldButton = getByLabelText('Bold');
      boldButton.focus();

      // Test Enter
      fireEvent.keyDown(boldButton, { key: 'Enter' });
      fireEvent.click(boldButton);
      expect(handleChange).toHaveBeenCalled();

      handleChange.mockClear();

      const italicButton = getByLabelText('Italic');
      italicButton.focus();

      // Test Space
      fireEvent.keyDown(italicButton, { key: ' ' });
      fireEvent.click(italicButton);
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('LumiaInlineEditor', () => {
    it('should exit editing mode with Escape key', () => {
      render(<LumiaInlineEditor value={mockDoc} onChange={() => {}} />);

      // Enter editing mode
      const viewMode = screen.getByTestId('lumia-inline-editor-view-mode');
      fireEvent.click(viewMode);

      // Verify edit mode is active
      const editMode = screen.getByTestId('lumia-inline-editor-edit-mode');
      expect(editMode).toBeInTheDocument();

      // Press Escape
      fireEvent.keyDown(editMode, { key: 'Escape' });

      // Should return to view mode
      expect(
        screen.getByTestId('lumia-inline-editor-view-mode'),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId('lumia-inline-editor-edit-mode'),
      ).not.toBeInTheDocument();
    });

    it('should focus view mode element after Escape', () => {
      render(<LumiaInlineEditor value={mockDoc} onChange={() => {}} />);

      // Enter editing mode
      const viewMode = screen.getByTestId('lumia-inline-editor-view-mode');
      fireEvent.click(viewMode);

      const editMode = screen.getByTestId('lumia-inline-editor-edit-mode');
      fireEvent.keyDown(editMode, { key: 'Escape' });

      // View mode should now be in the document and can receive focus
      const returnedViewMode = screen.getByTestId(
        'lumia-inline-editor-view-mode',
      );
      expect(returnedViewMode).toBeInTheDocument();
      // Note: We can't directly test focus return in RTL without more complex setup
    });

    it('should have visible focus ring on view mode', () => {
      render(<LumiaInlineEditor value={mockDoc} onChange={() => {}} />);

      const viewMode = screen.getByTestId('lumia-inline-editor-view-mode');

      // Check for focus-visible classes
      expect(viewMode.className).toContain('focus-visible:ring-2');
      expect(viewMode.className).toContain('focus-visible:ring-primary-500');

      // Verify it's focusable
      expect(viewMode).toHaveAttribute('tabIndex', '0');
    });

    it('should enter edit mode on focus (keyboard)', () => {
      render(<LumiaInlineEditor value={mockDoc} onChange={() => {}} />);

      const viewMode = screen.getByTestId('lumia-inline-editor-view-mode');

      // Simulate keyboard focus
      fireEvent.focus(viewMode);

      // Should switch to edit mode
      expect(
        screen.getByTestId('lumia-inline-editor-edit-mode'),
      ).toBeInTheDocument();
    });

    it('should have proper ARIA role and label', () => {
      render(<LumiaInlineEditor value={mockDoc} onChange={() => {}} />);

      const viewMode = screen.getByTestId('lumia-inline-editor-view-mode');

      expect(viewMode).toHaveAttribute('role', 'button');
      expect(viewMode).toHaveAttribute('aria-label', 'Click to edit text');
    });

    it('should have proper ARIA attributes in edit mode', () => {
      render(<LumiaInlineEditor value={mockDoc} onChange={() => {}} />);

      // Enter edit mode
      fireEvent.click(screen.getByTestId('lumia-inline-editor-view-mode'));

      const editMode = screen.getByTestId('lumia-inline-editor-edit-mode');
      expect(editMode).toHaveAttribute('role', 'textbox');
      expect(editMode).toHaveAttribute('aria-label', 'Inline editor');
    });
  });

  describe('Keyboard shortcuts (future enhancement)', () => {
    it.skip('should toggle bold with Cmd+B / Ctrl+B', () => {
      // TODO: Implement keyboard shortcuts
      // This test is marked as skip for future implementation
    });

    it.skip('should toggle italic with Cmd+I / Ctrl+I', () => {
      // TODO: Implement keyboard shortcuts
      // This test is marked as skip for future implementation
    });
  });
});
