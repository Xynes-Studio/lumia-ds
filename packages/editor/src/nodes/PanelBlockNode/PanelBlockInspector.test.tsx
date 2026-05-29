import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PanelBlockInspector } from './PanelBlockInspector';
import { vi, describe, beforeEach, it, expect, Mock } from 'vitest';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { $isPanelBlockNode } from './PanelBlockNode';

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
      data-testid="panel-title-input"
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
      data-testid="panel-variant-select"
      aria-label={label}
      data-value={value}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          data-testid={`panel-variant-option-${option.value}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
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
    ($getNodeByKey as unknown as Mock).mockReturnValue(null);
    ($isPanelBlockNode as unknown as Mock).mockReturnValue(false);
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

    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Note')).toBeInTheDocument();
  });

  it('registers update listener on mount', () => {
    render(<PanelBlockInspector nodeKey="panel-123" />);
    expect(mockRegisterUpdateListener).toHaveBeenCalled();
  });

  it('calls editor.update when variant changes', () => {
    render(<PanelBlockInspector nodeKey="panel-123" />);

    fireEvent.click(screen.getByTestId('panel-variant-option-warning'));

    expect(mockUpdate).toHaveBeenCalled();
  });

  it('calls editor.update when title changes', () => {
    render(<PanelBlockInspector nodeKey="panel-123" />);

    const input = screen.getByTestId('panel-title-input');
    fireEvent.change(input, { target: { value: 'New Title' } });

    expect(mockUpdate).toHaveBeenCalled();
  });

  describe('with real node mocking', () => {
    const mockNode = {
      getVariant: vi.fn(() => 'info'),
      getTitle: vi.fn(() => 'Test Title'),
      setVariant: vi.fn(),
      setTitle: vi.fn(),
      getWritable: vi.fn(() => ({
        setVariant: vi.fn(),
        setTitle: vi.fn(),
      })),
    };

    beforeEach(() => {
      ($getNodeByKey as unknown as Mock).mockReturnValue(mockNode);
      ($isPanelBlockNode as unknown as Mock).mockReturnValue(true);
    });

    it('loads node values on mount when node exists', () => {
      render(<PanelBlockInspector nodeKey="panel-123" />);
      expect(mockRead).toHaveBeenCalled();
    });

    it('updates variant from node on register update listener', () => {
      render(<PanelBlockInspector nodeKey="panel-123" />);
      expect(mockRegisterUpdateListener).toHaveBeenCalled();
    });

    it('handles variant change when node is valid', () => {
      render(<PanelBlockInspector nodeKey="panel-123" />);

      fireEvent.click(screen.getByTestId('panel-variant-option-success'));

      expect(mockUpdate).toHaveBeenCalled();
    });

    it('handles title change when node is valid', () => {
      render(<PanelBlockInspector nodeKey="panel-123" />);
      const input = screen.getByTestId('panel-title-input');

      fireEvent.change(input, { target: { value: 'Updated Title' } });

      expect(mockUpdate).toHaveBeenCalled();
    });
  });
});
