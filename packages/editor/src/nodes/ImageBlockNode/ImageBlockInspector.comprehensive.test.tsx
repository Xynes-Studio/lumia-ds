import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageBlockInspector } from './ImageBlockInspector';
import { vi, describe, beforeEach, it, expect, Mock } from 'vitest';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

// Mock lexical
vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: vi.fn(),
}));

vi.mock('lexical', () => ({
  $getNodeByKey: vi.fn(() => null),
}));

vi.mock('./ImageBlockNode', () => ({
  $isImageBlockNode: vi.fn(() => false),
}));

// Mock Lumia components
vi.mock('@lumia-ui/components', () => ({
  Input: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
  }) => (
    <input
      data-testid="alt-text-input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  ),
  Slider: ({
    value,
    onChange,
    min,
    max,
    step,
  }: {
    value: number;
    onChange: (val: number) => void;
    min: number;
    max: number;
    step: number;
  }) => (
    <input
      data-testid="width-slider"
      type="range"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
    />
  ),
}));

vi.mock('../../components/Dropdown', () => ({
  Dropdown: ({
    label,
    value,
    onChange,
    options,
  }: {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
  }) => (
    <div data-testid="layout-select" aria-label={label} data-value={value}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          data-testid={`layout-option-${option.value}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  ),
}));

describe('ImageBlockInspector', () => {
  const mockRegisterUpdateListener = vi.fn(() => vi.fn());
  const mockRead = vi.fn((callback: () => void) => callback());
  const mockUpdate = vi.fn((callback: () => void) => callback());
  const mockEditor = {
    getEditorState: vi.fn(() => ({
      read: mockRead,
    })),
    registerUpdateListener: mockRegisterUpdateListener,
    update: mockUpdate,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useLexicalComposerContext as Mock).mockReturnValue([mockEditor]);
  });

  it('renders the inspector title', () => {
    render(<ImageBlockInspector nodeKey="image-123" />);
    expect(screen.getByText('Image Inspector')).toBeInTheDocument();
  });

  it('renders alt text input', () => {
    render(<ImageBlockInspector nodeKey="image-123" />);
    expect(screen.getByTestId('alt-text-input')).toBeInTheDocument();
  });

  it('renders layout dropdown', () => {
    render(<ImageBlockInspector nodeKey="image-123" />);
    expect(screen.getByTestId('layout-select')).toBeInTheDocument();
  });

  it('renders width slider', () => {
    render(<ImageBlockInspector nodeKey="image-123" />);
    expect(screen.getByTestId('width-slider')).toBeInTheDocument();
  });

  it('renders all layout options', () => {
    render(<ImageBlockInspector nodeKey="image-123" />);

    expect(screen.getByText('Inline')).toBeInTheDocument();
    expect(screen.getByText('Breakout')).toBeInTheDocument();
    expect(screen.getByText('Full Width')).toBeInTheDocument();
  });

  it('registers update listener on mount', () => {
    render(<ImageBlockInspector nodeKey="image-123" />);
    expect(mockRegisterUpdateListener).toHaveBeenCalled();
  });

  it('calls editor.update when alt text changes', () => {
    render(<ImageBlockInspector nodeKey="image-123" />);

    const input = screen.getByTestId('alt-text-input');
    fireEvent.change(input, { target: { value: 'New alt text' } });

    expect(mockUpdate).toHaveBeenCalled();
  });

  it('calls editor.update when layout changes', () => {
    render(<ImageBlockInspector nodeKey="image-123" />);

    fireEvent.click(screen.getByTestId('layout-option-breakout'));

    expect(mockUpdate).toHaveBeenCalled();
  });

  it('calls editor.update when width changes', () => {
    render(<ImageBlockInspector nodeKey="image-123" />);

    const slider = screen.getByTestId('width-slider');
    fireEvent.change(slider, { target: { value: '75' } });

    expect(mockUpdate).toHaveBeenCalled();
  });
});
