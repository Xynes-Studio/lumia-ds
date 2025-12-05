import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LumiaEditor } from './lumia-editor';

describe('LumiaEditor', () => {
  it('renders without crashing', () => {
    const onChange = vi.fn();
    render(<LumiaEditor value={null} onChange={onChange} />);
    expect(screen.getByText('Type something...')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    const onChange = vi.fn();
    render(<LumiaEditor value={null} onChange={onChange} placeholder="Custom placeholder" />);
    expect(screen.getByText('Custom placeholder')).toBeInTheDocument();
  });
});
