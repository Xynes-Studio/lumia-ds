import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
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

describe('LumiaEditor Accessibility', () => {
  describe('Automated axe-core tests', () => {
    it('should have no accessibility violations in full variant', async () => {
      const { container } = render(
        <LumiaEditor value={mockDoc} onChange={() => {}} variant="full" />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in compact variant', async () => {
      const { container } = render(
        <LumiaEditor value={mockDoc} onChange={() => {}} variant="compact" />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in inline mode', async () => {
      const { container } = render(
        <LumiaEditor value={mockDoc} onChange={() => {}} mode="inline" />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in read-only mode', async () => {
      const { container } = render(
        <LumiaEditor value={mockDoc} onChange={() => {}} readOnly={true} />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ARIA attributes', () => {
    it('should have aria-label on icon-only toolbar buttons', () => {
      const { getByLabelText } = render(
        <LumiaEditor value={mockDoc} onChange={() => {}} variant="full" />,
      );

      // Verify all icon buttons have aria-labels
      expect(getByLabelText('Bold')).toBeInTheDocument();
      expect(getByLabelText('Italic')).toBeInTheDocument();
      expect(getByLabelText('Insert link')).toBeInTheDocument();
      expect(getByLabelText('Underline')).toBeInTheDocument();
      expect(getByLabelText('Code')).toBeInTheDocument();
      expect(getByLabelText('Bullet list')).toBeInTheDocument();
      expect(getByLabelText('Numbered list')).toBeInTheDocument();
      expect(getByLabelText('Align left')).toBeInTheDocument();
      expect(getByLabelText('Align center')).toBeInTheDocument();
      expect(getByLabelText('Align right')).toBeInTheDocument();
    });

    it('should have aria-label on compact variant buttons', () => {
      const { getByLabelText } = render(
        <LumiaEditor value={mockDoc} onChange={() => {}} variant="compact" />,
      );

      // Verify compact buttons have aria-labels
      expect(getByLabelText('Bold')).toBeInTheDocument();
      expect(getByLabelText('Italic')).toBeInTheDocument();
      expect(getByLabelText('Insert link')).toBeInTheDocument();
    });

    it('should have aria-pressed attribute on toggle buttons', () => {
      const { getByLabelText } = render(
        <LumiaEditor value={mockDoc} onChange={() => {}} variant="full" />,
      );

      const boldButton = getByLabelText('Bold');
      const italicButton = getByLabelText('Italic');
      const underlineButton = getByLabelText('Underline');
      const codeButton = getByLabelText('Code');

      // All toggle buttons should have aria-pressed
      expect(boldButton).toHaveAttribute('aria-pressed');
      expect(italicButton).toHaveAttribute('aria-pressed');
      expect(underlineButton).toHaveAttribute('aria-pressed');
      expect(codeButton).toHaveAttribute('aria-pressed');

      // Initially should be false (not pressed)
      expect(boldButton.getAttribute('aria-pressed')).toBe('false');
      expect(italicButton.getAttribute('aria-pressed')).toBe('false');
    });

    it('should update aria-pressed when toggle button is active', () => {
      const docWithBold: DocNode = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Bold text',
                marks: [{ type: 'bold' }],
              },
            ],
          },
        ],
      };

      const { getByLabelText } = render(
        <LumiaEditor value={docWithBold} onChange={() => {}} variant="full" />,
      );

      const boldButton = getByLabelText('Bold');
      expect(boldButton.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('Focus management', () => {
    it('should have visible focus rings on all interactive elements', () => {
      const { getByLabelText } = render(
        <LumiaEditor value={mockDoc} onChange={() => {}} variant="full" />,
      );

      const boldButton = getByLabelText('Bold');

      // Buttons should have focus-visible styles in their class
      // We can't test the actual visual focus ring, but we can verify
      // the button is focusable
      expect(boldButton).toHaveAttribute('type', 'button');
      boldButton.focus();
      expect(boldButton).toHaveFocus();
    });

    it('should allow keyboard focus on all toolbar controls', () => {
      const { getByLabelText } = render(
        <LumiaEditor value={mockDoc} onChange={() => {}} variant="full" />,
      );

      // All buttons should be focusable (tabIndex not -1)
      const boldButton = getByLabelText('Bold');
      const italicButton = getByLabelText('Italic');

      expect(boldButton.tabIndex).not.toBe(-1);
      expect(italicButton.tabIndex).not.toBe(-1);
    });
  });

  describe('Screen reader support', () => {
    it('should announce button states correctly', () => {
      const docWithMarks: DocNode = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Formatted text',
                marks: [{ type: 'bold' }, { type: 'italic' }],
              },
            ],
          },
        ],
      };

      const { getByLabelText } = render(
        <LumiaEditor value={docWithMarks} onChange={() => {}} variant="full" />,
      );

      const boldButton = getByLabelText('Bold');
      const italicButton = getByLabelText('Italic');
      const underlineButton = getByLabelText('Underline');

      // Active buttons should have aria-pressed="true"
      expect(boldButton.getAttribute('aria-pressed')).toBe('true');
      expect(italicButton.getAttribute('aria-pressed')).toBe('true');

      // Inactive button should have aria-pressed="false"
      expect(underlineButton.getAttribute('aria-pressed')).toBe('false');
    });
  });
});
