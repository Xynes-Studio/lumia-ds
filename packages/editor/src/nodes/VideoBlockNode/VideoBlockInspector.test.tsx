import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, beforeEach, it, expect, Mock } from 'vitest';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

// Import the component after mocking
import { VideoBlockInspector } from './VideoBlockInspector';

// Mock lexical
vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: vi.fn(),
}));

vi.mock('lexical', () => ({
  $getNodeByKey: vi.fn(() => null),
}));

vi.mock('./VideoBlockNode', () => ({
  $isVideoBlockNode: vi.fn(() => false),
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
      data-testid={
        placeholder?.includes('http') ? 'video-url-input' : 'video-title-input'
      }
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
      data-testid="video-provider-select"
      aria-label={label}
      value={value}
      onChange={onChange}
    >
      {children}
    </select>
  ),
}));

describe('VideoBlockInspector', () => {
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
    render(<VideoBlockInspector nodeKey="video-123" />);
    expect(screen.getByText('Video Inspector')).toBeInTheDocument();
  });

  it('renders URL input', () => {
    render(<VideoBlockInspector nodeKey="video-123" />);
    expect(screen.getByTestId('video-url-input')).toBeInTheDocument();
  });

  it('renders title input', () => {
    render(<VideoBlockInspector nodeKey="video-123" />);
    expect(screen.getByTestId('video-title-input')).toBeInTheDocument();
  });

  it('renders provider select', () => {
    render(<VideoBlockInspector nodeKey="video-123" />);
    expect(screen.getByTestId('video-provider-select')).toBeInTheDocument();
  });

  it('renders all provider options', () => {
    render(<VideoBlockInspector nodeKey="video-123" />);

    const select = screen.getByTestId('video-provider-select');
    expect(select).toContainHTML('YouTube');
    expect(select).toContainHTML('Vimeo');
    expect(select).toContainHTML('Loom');
    expect(select).toContainHTML('HTML5');
  });

  it('registers update listener on mount', () => {
    render(<VideoBlockInspector nodeKey="video-123" />);
    expect(mockRegisterUpdateListener).toHaveBeenCalled();
  });

  it('calls editor.update when URL changes', () => {
    render(<VideoBlockInspector nodeKey="video-123" />);

    const input = screen.getByTestId('video-url-input');
    fireEvent.change(input, {
      target: { value: 'https://youtube.com/watch?v=test' },
    });

    expect(mockUpdate).toHaveBeenCalled();
  });

  it('calls editor.update when title changes', () => {
    render(<VideoBlockInspector nodeKey="video-123" />);

    const input = screen.getByTestId('video-title-input');
    fireEvent.change(input, { target: { value: 'New Video Title' } });

    expect(mockUpdate).toHaveBeenCalled();
  });

  it('calls editor.update when provider changes', () => {
    render(<VideoBlockInspector nodeKey="video-123" />);

    const select = screen.getByTestId('video-provider-select');
    fireEvent.change(select, { target: { value: 'vimeo' } });

    expect(mockUpdate).toHaveBeenCalled();
  });
});
