/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LumiaEditor } from '../lumia-editor';
import userEvent from '@testing-library/user-event';

describe('LumiaEditor Link Support', () => {
  it.skip('inserts a link when using the toolbar button', async () => {
    const initialJSON: any = {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Visit Google',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    };

    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<LumiaEditor value={initialJSON} onChange={onChange} />);

    const editorInput = screen.getByRole('textbox');
    await screen.findByText('Visit Google');

    // Select "Google"
    // We need to manually set selection because user-event pointer interactions
    // with contenteditable are flaky in jsdom
    const paragraph = editorInput.querySelector('p');
    const span = paragraph?.firstChild;
    const textNode = span?.firstChild;
    console.log('Editor HTML:', editorInput.innerHTML);
    console.log('Text content:', textNode?.textContent);
    console.log('Text length:', textNode?.textContent?.length);
    console.log('Node type:', textNode?.nodeType);
    if (textNode) {
      const range = document.createRange();
      range.setStart(textNode, 6);
      range.setEnd(textNode, 12);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }

    // Trigger selection change event for Lexical to pick it up
    await user.click(editorInput); // Click to ensure focus and trigger updates

    // Click Link button
    const linkButton = screen.getByLabelText('Insert Link');
    await user.click(linkButton);

    // Enter URL
    const urlInput = screen.getByPlaceholderText('https://example.com');
    await user.type(urlInput, 'https://google.com');

    // Click Save
    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    // Verify Link in DOM
    const link = await screen.findByRole('link');
    expect(link).toHaveAttribute('href', 'https://google.com');
    expect(link).toHaveTextContent('Google');

    // Verify JSON output
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      // Navigate through JSON to find LinkNode
      // root -> paragraph -> link -> text
      const paragraph = lastCall.root.children[0];
      const linkNode = paragraph.children.find((c: any) => c.type === 'link');
      expect(linkNode).toBeDefined();
      expect(linkNode.url).toBe('https://google.com');
      expect(linkNode.children[0].text).toBe('Google');
    });
  });

  it('renders link from JSON', async () => {
    const initialJSON: any = {
      root: {
        children: [
          {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Google',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'link',
                version: 1,
                url: 'https://google.com',
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    };

    const onChange = vi.fn();
    render(<LumiaEditor value={initialJSON} onChange={onChange} />);

    const link = await screen.findByRole('link');
    expect(link).toHaveAttribute('href', 'https://google.com');
    expect(link).toHaveTextContent('Google');
  });
});
