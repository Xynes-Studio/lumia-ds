import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, beforeEach, it, expect, Mock } from 'vitest';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { $isVideoBlockNode } from './VideoBlockNode';

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

  it('loads video node data from editor state and update listener', () => {
    const node = {
      __src: 'https://video.example/start',
      __provider: 'youtube',
      __title: 'Initial title',
    };
    ($getNodeByKey as Mock).mockReturnValue(node);
    ($isVideoBlockNode as Mock).mockReturnValue(true);
    mockRegisterUpdateListener.mockImplementation((listener) => {
      node.__src = 'https://video.example/updated';
      node.__provider = 'html5';
      node.__title = 'Updated title';
      listener({ editorState: { read: (callback: () => void) => callback() } });
      return vi.fn();
    });

    render(<VideoBlockInspector nodeKey="video-123" />);

    expect(screen.getByTestId('video-url-input')).toHaveValue(
      'https://video.example/updated',
    );
    expect(screen.getByTestId('video-provider-select')).toHaveValue('html5');
    expect(screen.getByTestId('video-title-input')).toHaveValue(
      'Updated title',
    );
  });

  it('updates node methods only when the resolved node is a video block', () => {
    const setSrc = vi.fn();
    const setProvider = vi.fn();
    const setTitle = vi.fn();
    const node = { setSrc, setProvider, setTitle };
    ($getNodeByKey as Mock).mockReturnValue(node);
    ($isVideoBlockNode as Mock).mockReturnValue(true);

    render(<VideoBlockInspector nodeKey="video-123" />);

    fireEvent.change(screen.getByTestId('video-url-input'), {
      target: { value: 'https://video.example/next' },
    });
    fireEvent.change(screen.getByTestId('video-provider-select'), {
      target: { value: 'loom' },
    });
    fireEvent.change(screen.getByTestId('video-title-input'), {
      target: { value: 'Changed title' },
    });

    expect(setSrc).toHaveBeenCalledWith('https://video.example/next');
    expect(setProvider).toHaveBeenCalledWith('loom');
    expect(setTitle).toHaveBeenCalledWith('Changed title');
  });
});
