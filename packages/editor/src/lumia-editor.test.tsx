import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LumiaEditor } from './lumia-editor';
import userEvent from '@testing-library/user-event';

describe('LumiaEditor', () => {
  it('renders without crashing', () => {
    const onChange = vi.fn();
    render(<LumiaEditor value={null} onChange={onChange} />);
    expect(screen.getByText('Enter some text...')).toBeInTheDocument();
  });

  it('passes props down to primitive', () => {
    const onChange = vi.fn();
    const value = null;
    render(
      <LumiaEditor
        value={value}
        onChange={onChange}
        readOnly={true}
        className="test-class"
      />,
    );

    // Check if primitive rendered content (placeholder from primitive)
    expect(screen.getByText('Enter some text...')).toBeInTheDocument();

    // Check if className was passed
    const container = screen
      .getByText('Enter some text...')
      .closest('.editor-container');
    expect(container).toHaveClass('test-class');
  });

  it('calls onChange with correct JSON structure when typing', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<LumiaEditor value={null} onChange={onChange} />);

    const editorInput = screen.getByRole('textbox');
    await user.type(editorInput, 'A');

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(lastCall).toHaveProperty('root');
      expect(lastCall.root).toHaveProperty('children');
    });
  });

  it('loads initial value correctly', async () => {
    // Let's manually construct a simple valid JSON for "Hello"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                text: 'Initial Content',
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
    render(
      <LumiaEditor
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value={initialJSON as any}
        onChange={onChange}
      />,
    );

    expect(screen.getByText('Initial Content')).toBeInTheDocument();
  });
});
