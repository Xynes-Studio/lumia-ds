import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LumiaEditor } from './lumia-editor';

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
});
