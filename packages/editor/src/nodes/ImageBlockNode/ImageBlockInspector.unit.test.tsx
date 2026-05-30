import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, beforeEach, it, expect, Mock } from 'vitest';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { $isImageBlockNode } from './ImageBlockNode';
import { ImageBlockInspector } from './ImageBlockInspector';

vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: vi.fn(),
}));

vi.mock('lexical', () => ({
  $getNodeByKey: vi.fn(() => null),
}));

vi.mock('./ImageBlockNode', () => ({
  $isImageBlockNode: vi.fn(() => false),
}));

vi.mock('@lumia-ui/components', () => ({
  Input: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <input data-testid="alt-text-input" value={value} onChange={onChange} />
  ),
  Slider: ({
    value,
    onChange,
  }: {
    value: number;
    onChange: (value: number) => void;
  }) => (
    <input
      type="range"
      data-testid="width-slider"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  ),
}));

vi.mock('../../components/Dropdown', () => ({
  Dropdown: ({
    value,
    onChange,
    options,
  }: {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
  }) => (
    <div data-testid="layout-select" data-value={value}>
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

describe('ImageBlockInspector unit', () => {
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

  it('loads image node data from editor state and update listener', () => {
    const node = {
      __alt: 'Initial alt',
      __layout: 'inline',
      __width: 25,
    };
    ($getNodeByKey as Mock).mockReturnValue(node);
    ($isImageBlockNode as Mock).mockReturnValue(true);
    mockRegisterUpdateListener.mockImplementation((listener) => {
      node.__alt = 'Updated alt';
      node.__layout = 'fullWidth';
      node.__width = 88;
      listener({ editorState: { read: (callback: () => void) => callback() } });
      return vi.fn();
    });

    render(<ImageBlockInspector nodeKey="image-123" />);

    expect(screen.getByTestId('alt-text-input')).toHaveValue('Updated alt');
    expect(screen.getByTestId('layout-select')).toHaveAttribute(
      'data-value',
      'fullWidth',
    );
    expect(screen.getByTestId('width-slider')).toHaveValue('88');
  });

  it('updates image node methods when the resolved node is an image block', () => {
    const setAlt = vi.fn();
    const setLayout = vi.fn();
    const setWidth = vi.fn();
    const node = { setAlt, setLayout, setWidth };
    ($getNodeByKey as Mock).mockReturnValue(node);
    ($isImageBlockNode as Mock).mockReturnValue(true);

    render(<ImageBlockInspector nodeKey="image-123" />);

    fireEvent.change(screen.getByTestId('alt-text-input'), {
      target: { value: 'Accessible alt' },
    });
    fireEvent.click(screen.getByTestId('layout-option-breakout'));
    fireEvent.change(screen.getByTestId('width-slider'), {
      target: { value: '75' },
    });

    expect(setAlt).toHaveBeenCalledWith('Accessible alt');
    expect(setLayout).toHaveBeenCalledWith('breakout');
    expect(setWidth).toHaveBeenCalledWith(75);
  });

  it('does not call node mutators when the resolved node is not an image block', () => {
    const setAlt = vi.fn();
    const setLayout = vi.fn();
    const setWidth = vi.fn();
    ($getNodeByKey as Mock).mockReturnValue({ setAlt, setLayout, setWidth });
    ($isImageBlockNode as Mock).mockReturnValue(false);

    render(<ImageBlockInspector nodeKey="image-123" />);

    fireEvent.change(screen.getByTestId('alt-text-input'), {
      target: { value: 'Ignored alt' },
    });
    fireEvent.click(screen.getByTestId('layout-option-breakout'));
    fireEvent.change(screen.getByTestId('width-slider'), {
      target: { value: '75' },
    });

    expect(setAlt).not.toHaveBeenCalled();
    expect(setLayout).not.toHaveBeenCalled();
    expect(setWidth).not.toHaveBeenCalled();
  });
});
