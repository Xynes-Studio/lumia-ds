import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render } from '@testing-library/react';
import { DragDropPastePlugin } from './DragDropPastePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useMediaContext } from '../EditorProvider';
import { DROP_COMMAND, PASTE_COMMAND } from 'lexical';

// Mock dependencies
vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: vi.fn(),
}));

vi.mock('../EditorProvider', () => ({
  useMediaContext: vi.fn(),
}));

// Mock Lexical nodes and utils to return simple objects we can assert on
const mockNode = {
  getKey: vi.fn(() => 'node-1'),
  getParentOrThrow: vi.fn(() => ({})),
  getWritable: vi.fn(() => ({})),
};

vi.mock('lexical', () => ({
  $createParagraphNode: vi.fn(),
  $insertNodes: vi.fn(),
  $isRootOrShadowRoot: vi.fn(() => true),
  COMMAND_PRIORITY_HIGH: 1,
  DROP_COMMAND: Symbol('DROP_COMMAND'),
  PASTE_COMMAND: Symbol('PASTE_COMMAND'),
  $getNodeByKey: vi.fn(() => mockNode),
}));

vi.mock('../nodes/ImageBlockNode/ImageBlockNode', () => ({
  $createImageBlockNode: vi.fn(() => mockNode),
  $isImageBlockNode: vi.fn(() => false),
}));

vi.mock('../nodes/VideoBlockNode/VideoBlockNode', () => ({
  $createVideoBlockNode: vi.fn(() => mockNode),
  $isVideoBlockNode: vi.fn(() => false),
}));

vi.mock('../nodes/FileBlockNode/FileBlockNode', () => ({
  $createFileBlockNode: vi.fn(() => mockNode),
  $isFileBlockNode: vi.fn(() => false),
}));

vi.mock('@lexical/utils', () => ({
  $wrapNodeInElement: vi.fn(() => ({
    selectEnd: vi.fn(),
  })),
  mergeRegister: vi.fn(
    (...fns) =>
      () =>
        fns.forEach((f) => f()),
  ),
}));

describe('DragDropPastePlugin', () => {
  const mockEditor = {
    registerCommand: vi.fn(() => vi.fn()),
    update: vi.fn((cb) => cb()),
  };

  const mockMediaConfig = {
    uploadAdapter: {
      uploadFile: vi.fn(),
    },
    callbacks: {
      onUploadStart: vi.fn(),
      onUploadProgress: vi.fn(),
      onUploadComplete: vi.fn(),
      onUploadError: vi.fn(),
    },
    allowedImageTypes: ['image/jpeg', 'image/png'],
    allowedVideoTypes: ['video/mp4'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useLexicalComposerContext as Mock).mockReturnValue([mockEditor]);
    (useMediaContext as Mock).mockReturnValue(mockMediaConfig);
  });

  it('renders nothing', () => {
    const { container } = render(<DragDropPastePlugin />);
    expect(container.firstChild).toBeNull();
  });

  it('registers DROP_COMMAND and PASTE_COMMAND', () => {
    render(<DragDropPastePlugin />);
    expect(mockEditor.registerCommand).toHaveBeenCalledWith(
      DROP_COMMAND,
      expect.any(Function),
      1,
    );
    expect(mockEditor.registerCommand).toHaveBeenCalledWith(
      PASTE_COMMAND,
      expect.any(Function),
      1,
    );
  });

  it('handles drop event with files', async () => {
    render(<DragDropPastePlugin />);

    // Get the registered drop handler
    const dropHandler = mockEditor.registerCommand.mock.calls.find(
      (call) => call[0] === DROP_COMMAND,
    )[1];

    const file = new File(['content'], 'test.png', { type: 'image/png' });
    const event = {
      dataTransfer: { files: [file] },
      preventDefault: vi.fn(),
    };

    // Mock URL.createObjectURL
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:test');
    globalThis.URL.revokeObjectURL = vi.fn();

    await dropHandler(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(mockMediaConfig.callbacks.onUploadStart).toHaveBeenCalled();
    expect(mockMediaConfig.uploadAdapter.uploadFile).toHaveBeenCalled();
  });

  it('ignores drop without files', () => {
    render(<DragDropPastePlugin />);
    const dropHandler = mockEditor.registerCommand.mock.calls.find(
      (call) => call[0] === DROP_COMMAND,
    )[1];

    const event = {
      dataTransfer: { files: [] },
      preventDefault: vi.fn(),
    };

    const result = dropHandler(event);
    expect(result).toBe(false);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('handles paste event with files', async () => {
    render(<DragDropPastePlugin />);

    const pasteHandler = mockEditor.registerCommand.mock.calls.find(
      (call) => call[0] === PASTE_COMMAND,
    )[1];

    const file = new File(['content'], 'test.mp4', { type: 'video/mp4' });
    const event = {
      clipboardData: { files: [file] },
      preventDefault: vi.fn(),
    };

    globalThis.URL.createObjectURL = vi.fn(() => 'blob:video');
    globalThis.URL.revokeObjectURL = vi.fn();

    await pasteHandler(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(mockMediaConfig.callbacks.onUploadStart).toHaveBeenCalled();
  });

  it('ignores paste without files', () => {
    render(<DragDropPastePlugin />);
    const pasteHandler = mockEditor.registerCommand.mock.calls.find(
      (call) => call[0] === PASTE_COMMAND,
    )[1];

    const event = {
      clipboardData: { files: [] },
      preventDefault: vi.fn(),
    };

    const result = pasteHandler(event);
    expect(result).toBe(false);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('does not register commands when no upload adapter', () => {
    (useMediaContext as Mock).mockReturnValue(null);
    render(<DragDropPastePlugin />);
    // When no upload adapter, registerCommand should not be called
    expect(mockEditor.registerCommand).not.toHaveBeenCalled();
  });
});
