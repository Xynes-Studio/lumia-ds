import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatusInspector } from './StatusInspector';
import { vi, describe, beforeEach, it, expect, Mock } from 'vitest';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

// Mock luxical
vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: vi.fn(),
}));

vi.mock('lexical', () => ({
  $getNodeByKey: vi.fn(() => null),
}));

vi.mock('./StatusNode', () => ({
  $isStatusNode: vi.fn(() => false),
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
      data-testid="status-text-input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
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
    <div
      data-testid="status-color-select"
      aria-label={label}
      data-value={value}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          data-testid={`status-color-option-${option.value}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  ),
}));

describe('StatusInspector', () => {
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
    render(<StatusInspector nodeKey="status-123" />);
    expect(screen.getByText('Status Inspector')).toBeInTheDocument();
  });

  it('renders text input', () => {
    render(<StatusInspector nodeKey="status-123" />);
    expect(screen.getByTestId('status-text-input')).toBeInTheDocument();
  });

  it('renders color select', () => {
    render(<StatusInspector nodeKey="status-123" />);
    expect(screen.getByTestId('status-color-select')).toBeInTheDocument();
  });

  it('renders all color options', () => {
    render(<StatusInspector nodeKey="status-123" />);

    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('registers update listener on mount', () => {
    render(<StatusInspector nodeKey="status-123" />);
    expect(mockRegisterUpdateListener).toHaveBeenCalled();
  });

  it('calls editor.update when text changes', () => {
    render(<StatusInspector nodeKey="status-123" />);

    const input = screen.getByTestId('status-text-input');
    fireEvent.change(input, { target: { value: 'New Status' } });

    expect(mockUpdate).toHaveBeenCalled();
  });

  it('calls editor.update when color changes', () => {
    render(<StatusInspector nodeKey="status-123" />);

    fireEvent.click(screen.getByTestId('status-color-option-success'));

    expect(mockUpdate).toHaveBeenCalled();
  });
});
