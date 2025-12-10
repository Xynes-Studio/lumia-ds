import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LumiaInlineEditor } from './LumiaInlineEditor';
import userEvent from '@testing-library/user-event';

describe('LumiaInlineEditor', () => {
  it('renders without crashing', () => {
    const onChange = vi.fn();
    render(<LumiaInlineEditor value={null} onChange={onChange} />);
    expect(screen.getByText('Enter text...')).toBeInTheDocument();
  });

  it('calls onChange with correct JSON structure when typing', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<LumiaInlineEditor value={null} onChange={onChange} />);

    const editorInput = screen.getByRole('textbox');
    await user.type(editorInput, 'Title');

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(lastCall).toHaveProperty('root');
      expect(lastCall.root).toHaveProperty('children');
    });
  });

  it('loads initial value correctly', async () => {
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
                text: 'Initial Title',
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
      <LumiaInlineEditor
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value={initialJSON as any}
        onChange={onChange}
      />,
    );

    expect(screen.getByText('Initial Title')).toBeInTheDocument();
  });
});
