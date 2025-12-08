import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PanelBlockInspector } from './PanelBlockInspector';
import { vi, describe, beforeEach, it, expect, Mock } from 'vitest';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

// Mock lexical
vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: vi.fn(),
}));

vi.mock('lexical', () => ({
  $getNodeByKey: vi.fn(() => null),
}));

vi.mock('./PanelBlockNode', () => ({
  $isPanelBlockNode: vi.fn(() => false),
}));

// Mock Lumia components
vi.mock('@lumia/components', () => ({
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
      data-testid="panel-title-input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  ),
  Select: ({
    label,
    value,
    onChange,
    children,
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode;
  }) => (
    <select
      data-testid="panel-variant-select"
      aria-label={label}
      value={value}
      onChange={onChange}
    >
      {children}
    </select>
  ),
}));

describe('PanelBlockInspector', () => {
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
    render(<PanelBlockInspector nodeKey="panel-123" />);
    expect(screen.getByText('Panel Inspector')).toBeInTheDocument();
  });

  it('renders variant select', () => {
    render(<PanelBlockInspector nodeKey="panel-123" />);
    expect(screen.getByTestId('panel-variant-select')).toBeInTheDocument();
  });

  it('renders title input', () => {
    render(<PanelBlockInspector nodeKey="panel-123" />);
    expect(screen.getByTestId('panel-title-input')).toBeInTheDocument();
  });

  it('renders all variant options', () => {
    render(<PanelBlockInspector nodeKey="panel-123" />);

    const select = screen.getByTestId('panel-variant-select');
    expect(select).toContainHTML('Info');
    expect(select).toContainHTML('Warning');
    expect(select).toContainHTML('Success');
    expect(select).toContainHTML('Note');
  });

  it('registers update listener on mount', () => {
    render(<PanelBlockInspector nodeKey="panel-123" />);
    expect(mockRegisterUpdateListener).toHaveBeenCalled();
  });

  it('calls editor.update when variant changes', () => {
    render(<PanelBlockInspector nodeKey="panel-123" />);

    const select = screen.getByTestId('panel-variant-select');
    fireEvent.change(select, { target: { value: 'warning' } });

    expect(mockUpdate).toHaveBeenCalled();
  });

  it('calls editor.update when title changes', () => {
    render(<PanelBlockInspector nodeKey="panel-123" />);

    const input = screen.getByTestId('panel-title-input');
    fireEvent.change(input, { target: { value: 'New Title' } });

    expect(mockUpdate).toHaveBeenCalled();
  });
});
