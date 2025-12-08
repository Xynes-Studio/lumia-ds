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

  describe('File Type Detection', () => {
    beforeEach(() => {
      globalThis.URL.createObjectURL = vi.fn(() => 'blob:test');
      globalThis.URL.revokeObjectURL = vi.fn();
    });

    it('detects image file type and calls onUploadStart with image type', async () => {
      render(<DragDropPastePlugin />);

      const dropHandler = mockEditor.registerCommand.mock.calls.find(
        (call) => call[0] === DROP_COMMAND,
      )[1];

      const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
      const event = {
        dataTransfer: { files: [file] },
        preventDefault: vi.fn(),
      };

      await dropHandler(event);

      expect(mockMediaConfig.callbacks.onUploadStart).toHaveBeenCalledWith(
        file,
        'image',
      );
    });

    it('detects video file type and calls onUploadStart with video type', async () => {
      render(<DragDropPastePlugin />);

      const dropHandler = mockEditor.registerCommand.mock.calls.find(
        (call) => call[0] === DROP_COMMAND,
      )[1];

      const file = new File(['video content'], 'movie.mp4', {
        type: 'video/mp4',
      });
      const event = {
        dataTransfer: { files: [file] },
        preventDefault: vi.fn(),
      };

      await dropHandler(event);

      expect(mockMediaConfig.callbacks.onUploadStart).toHaveBeenCalledWith(
        file,
        'video',
      );
    });

    it('detects generic file type and calls onUploadStart with file type', async () => {
      render(<DragDropPastePlugin />);

      const dropHandler = mockEditor.registerCommand.mock.calls.find(
        (call) => call[0] === DROP_COMMAND,
      )[1];

      const file = new File(['pdf content'], 'document.pdf', {
        type: 'application/pdf',
      });
      const event = {
        dataTransfer: { files: [file] },
        preventDefault: vi.fn(),
      };

      await dropHandler(event);

      expect(mockMediaConfig.callbacks.onUploadStart).toHaveBeenCalledWith(
        file,
        'file',
      );
    });
  });

  describe('Upload Completion', () => {
    beforeEach(() => {
      globalThis.URL.createObjectURL = vi.fn(() => 'blob:test');
      globalThis.URL.revokeObjectURL = vi.fn();
    });

    it('calls onUploadComplete after successful upload', async () => {
      const uploadResult = {
        url: 'https://example.com/uploaded.jpg',
        mime: 'image/jpeg',
        size: 1024,
      };
      mockMediaConfig.uploadAdapter.uploadFile.mockResolvedValueOnce(
        uploadResult,
      );

      render(<DragDropPastePlugin />);

      const dropHandler = mockEditor.registerCommand.mock.calls.find(
        (call) => call[0] === DROP_COMMAND,
      )[1];

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const event = {
        dataTransfer: { files: [file] },
        preventDefault: vi.fn(),
      };

      await dropHandler(event);

      // Wait for async upload to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockMediaConfig.callbacks.onUploadComplete).toHaveBeenCalledWith(
        file,
        uploadResult,
      );
    });

    it('calls onUploadError when upload fails', async () => {
      const uploadError = new Error('Network error');
      mockMediaConfig.uploadAdapter.uploadFile.mockRejectedValueOnce(
        uploadError,
      );

      render(<DragDropPastePlugin />);

      const dropHandler = mockEditor.registerCommand.mock.calls.find(
        (call) => call[0] === DROP_COMMAND,
      )[1];

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const event = {
        dataTransfer: { files: [file] },
        preventDefault: vi.fn(),
      };

      await dropHandler(event);

      // Wait for async upload to fail
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockMediaConfig.callbacks.onUploadError).toHaveBeenCalledWith(
        file,
        uploadError,
      );
    });
  });

  describe('File Size Validation', () => {
    it('rejects files exceeding max size', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });

      const configWithLimit = {
        ...mockMediaConfig,
        maxFileSizeMB: 1,
      };
      (useMediaContext as Mock).mockReturnValue(configWithLimit);

      render(<DragDropPastePlugin />);

      const dropHandler = mockEditor.registerCommand.mock.calls.find(
        (call) => call[0] === DROP_COMMAND,
      )[1];

      // Create a file that's larger than 1MB
      const largeContent = new Array(2 * 1024 * 1024).fill('a').join('');
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
      const event = {
        dataTransfer: { files: [file] },
        preventDefault: vi.fn(),
      };

      await dropHandler(event);

      expect(alertSpy).toHaveBeenCalledWith('File size exceeds 1MB');
      expect(
        configWithLimit.uploadAdapter.uploadFile,
      ).not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });
  });
});

