import { render } from '@testing-library/react';
import { LumiaDocument } from './components/LumiaDocument';
import { describe, it, expect } from 'vitest';

describe('LumiaDocument', () => {
  it('renders correctly', () => {
    const json = {
      root: {
        children: [
          {
            type: 'heading',
            tag: 'h1',
            children: [{ type: 'text', text: 'Title', format: 0 }],
            format: '',
            indent: 0,
            version: 1,
          },
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Hello content', format: 0 }],
            format: '',
            indent: 0,
            version: 1,
          },
        ],
        type: 'root',
        format: '',
        indent: 0,
        direction: 'ltr',
        version: 1,
      },
    } as unknown as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    const { container } = render(<LumiaDocument value={json} />);
    expect(container).toMatchSnapshot();
  });
});
