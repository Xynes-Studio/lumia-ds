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
    // STORAGE-LIVE-4: the production code uses
    //   editor.update(cb, { onUpdate: () => runUploadAfterCommit() })
    // The mock fires the optimistic callback synchronously AND invokes
    // `options.onUpdate` immediately, so tests can keep their existing
    // "did the upload run?" assertions without each one driving onUpdate
    // by hand. The new STORAGE-11 regression tests explicitly assert the
    // onUpdate path via the asyncEditor fake below.
    update: vi.fn((cb, options?: { onUpdate?: () => void }) => {
      cb();
      options?.onUpdate?.();
    }),
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

  const getRegisteredHandler = (
    command: typeof DROP_COMMAND | typeof PASTE_COMMAND,
  ) => {
    const calls = (mockEditor.registerCommand as Mock).mock.calls as Array<
      [
        typeof DROP_COMMAND | typeof PASTE_COMMAND,
        (event: unknown) => boolean | Promise<boolean>,
        number,
      ]
    >;
    const call = calls.find((registeredCall) => registeredCall[0] === command);
    expect(call).toBeDefined();
    return call?.[1] as unknown as (
      event: unknown,
    ) => boolean | Promise<boolean>;
  };

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

    const dropHandler = getRegisteredHandler(DROP_COMMAND);

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
    const dropHandler = getRegisteredHandler(DROP_COMMAND);

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

    const pasteHandler = getRegisteredHandler(PASTE_COMMAND);

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
    const pasteHandler = getRegisteredHandler(PASTE_COMMAND);

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

      const dropHandler = getRegisteredHandler(DROP_COMMAND);

      const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
      const event = {
        dataTransfer: { files: [file] },
        preventDefault: vi.fn(),
      };

      await dropHandler(event);

      expect(mockMediaConfig.callbacks.onUploadStart).toHaveBeenCalledWith(
        file,
        'image',
        'drag-drop',
      );
    });

    it('detects video file type and calls onUploadStart with video type', async () => {
      render(<DragDropPastePlugin />);

      const dropHandler = getRegisteredHandler(DROP_COMMAND);

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
        'drag-drop',
      );
    });

    it('detects generic file type and calls onUploadStart with file type', async () => {
      render(<DragDropPastePlugin />);

      const dropHandler = getRegisteredHandler(DROP_COMMAND);

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
        'drag-drop',
      );
    });

    // STORAGE-LIVE-5: source detection — paste path emits source='paste'
    it("emits onUploadStart with source='paste' when file arrives via PASTE_COMMAND", async () => {
      render(<DragDropPastePlugin />);

      const pasteHandler = getRegisteredHandler(PASTE_COMMAND);

      const file = new File(['content'], 'pasted.png', { type: 'image/png' });
      const event = {
        clipboardData: { files: [file] },
        preventDefault: vi.fn(),
      };

      await pasteHandler(event as unknown as ClipboardEvent);

      expect(mockMediaConfig.callbacks.onUploadStart).toHaveBeenCalledWith(
        file,
        'image',
        'paste',
      );
    });

    // STORAGE-LIVE-5: source detection — drop path emits source='drag-drop'
    // (already covered above implicitly, but make the contract explicit)
    it("emits onUploadStart with source='drag-drop' when file arrives via DROP_COMMAND", async () => {
      render(<DragDropPastePlugin />);

      const dropHandler = getRegisteredHandler(DROP_COMMAND);

      const file = new File(['content'], 'dropped.png', { type: 'image/png' });
      const event = {
        dataTransfer: { files: [file] },
        preventDefault: vi.fn(),
      };

      await dropHandler(event);

      const calls = (mockMediaConfig.callbacks.onUploadStart as Mock).mock
        .calls;
      const lastCall = calls.at(-1);
      // Closed-set source taxonomy: drag-drop on DROP_COMMAND, never anything else
      expect(lastCall?.[2]).toBe('drag-drop');
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

      const dropHandler = getRegisteredHandler(DROP_COMMAND);

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

      const dropHandler = getRegisteredHandler(DROP_COMMAND);

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
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      const configWithLimit = {
        ...mockMediaConfig,
        maxFileSizeMB: 1,
      };
      (useMediaContext as Mock).mockReturnValue(configWithLimit);

      render(<DragDropPastePlugin />);

      const dropHandler = getRegisteredHandler(DROP_COMMAND);

      // Create a file that's larger than 1MB
      const largeContent = new Array(2 * 1024 * 1024).fill('a').join('');
      const file = new File([largeContent], 'large.jpg', {
        type: 'image/jpeg',
      });
      const event = {
        dataTransfer: { files: [file] },
        preventDefault: vi.fn(),
      };

      await dropHandler(event);

      expect(alertSpy).toHaveBeenCalledWith('File size exceeds 1MB');
      expect(configWithLimit.uploadAdapter.uploadFile).not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });
  });

  describe('STORAGE-11 regression: discrete update + objectId persistence', () => {
    beforeEach(() => {
      globalThis.URL.createObjectURL = vi.fn(() => 'blob:test');
      globalThis.URL.revokeObjectURL = vi.fn();
    });

    it('passes an `onUpdate` callback to the optimistic-node editor.update call so the upload fires post-commit', async () => {
      render(<DragDropPastePlugin />);

      const dropHandler = getRegisteredHandler(DROP_COMMAND);
      const file = new File(['content'], 'test.png', { type: 'image/png' });
      const event = {
        dataTransfer: { files: [file] },
        preventDefault: vi.fn(),
      };

      await dropHandler(event);

      // The FIRST editor.update call wraps the optimistic-node insertion and
      // must include `options.onUpdate`. The post-commit hook is how the
      // upload kicks off — `discrete: true` would NOT make the optimistic
      // update synchronous from inside a command handler (Lexical only
      // applies `discrete: true` synchronously outside an active update
      // cycle, and PASTE_COMMAND callbacks run inside one).
      const updateCalls = (mockEditor.update as Mock).mock.calls as Array<
        [() => void, { onUpdate?: () => void } | undefined]
      >;
      expect(updateCalls.length).toBeGreaterThanOrEqual(1);
      const [, firstOptions] = updateCalls[0];
      expect(typeof firstOptions?.onUpdate).toBe('function');
    });

    it('starts the upload from the `onUpdate` post-commit hook (regression: nodeKey is null when read synchronously after editor.update)', async () => {
      // Simulate real Lexical: `editor.update()` does NOT run the callback
      // synchronously from inside a command handler, so `nodeKey` is null
      // immediately after the call. The fix invokes the upload from
      // `options.onUpdate`, which Lexical guarantees fires AFTER commit.
      const queuedOnUpdates: Array<() => void> = [];
      const asyncEditor = {
        registerCommand: vi.fn(() => vi.fn()),
        update: vi.fn((cb: () => void, options?: { onUpdate?: () => void }) => {
          // Run the optimistic mutation synchronously (so the optimistic
          // node is created), but DEFER the onUpdate callback to mimic
          // real Lexical's post-commit timing.
          cb();
          if (options?.onUpdate) {
            queuedOnUpdates.push(options.onUpdate);
          }
        }),
      };
      (useLexicalComposerContext as Mock).mockReturnValue([asyncEditor]);

      render(<DragDropPastePlugin />);

      const dropCall = (asyncEditor.registerCommand as Mock).mock.calls.find(
        (c) => c[0] === DROP_COMMAND,
      );
      const dropHandler = dropCall?.[1] as (e: unknown) => Promise<boolean>;

      const file = new File(['content'], 'test.png', { type: 'image/png' });
      const event = {
        dataTransfer: { files: [file] },
        preventDefault: vi.fn(),
      };
      await dropHandler(event);

      // BEFORE the post-commit hook fires, no upload should have started.
      expect(mockMediaConfig.uploadAdapter.uploadFile).not.toHaveBeenCalled();

      // Now flush the queued onUpdate callbacks (simulating Lexical's
      // post-commit phase).
      for (const cb of queuedOnUpdates) cb();
      await new Promise((resolve) => setTimeout(resolve, 10));

      // The upload IS called via the onUpdate hook.
      expect(mockMediaConfig.uploadAdapter.uploadFile).toHaveBeenCalledTimes(1);
    });

    it('does NOT call `.selectEnd()` after wrapping the optimistic node (regression: post-upload status flip would re-scroll the editor to the bottom)', async () => {
      // STORAGE-LIVE-4: the previous implementation called
      // `$wrapNodeInElement(node, $createParagraphNode).selectEnd()`,
      // which moved the selection to the bottom of the editor. The
      // post-upload `editor.update()` that flips `__status` would then
      // cause Lexical to scroll that selection into view, hijacking the
      // user's scroll position during the 1-2s upload window.
      //
      // The fix keeps `$wrapNodeInElement(...)` but does NOT call
      // `.selectEnd()`. We assert this contract by inspecting the
      // selectEnd mock on the wrapped paragraph.
      const { $wrapNodeInElement } = await import('@lexical/utils');
      const selectEndSpy = vi.fn();
      ($wrapNodeInElement as unknown as Mock).mockReturnValue({
        selectEnd: selectEndSpy,
      });

      render(<DragDropPastePlugin />);
      const dropHandler = getRegisteredHandler(DROP_COMMAND);
      const file = new File(['content'], 'test.png', { type: 'image/png' });
      const event = {
        dataTransfer: { files: [file] },
        preventDefault: vi.fn(),
      };
      await dropHandler(event);

      expect(selectEndSpy).not.toHaveBeenCalled();
    });

    it('persists `result.objectId` on the ImageBlock writable so stripTransientImageUrls strips the signed URL on save', async () => {
      const uploadResult = {
        url: 'https://example.com/signed?X-Amz-Signature=abc',
        mime: 'image/png',
        size: 1024,
        objectId: 'obj-uuid-123',
      };
      mockMediaConfig.uploadAdapter.uploadFile.mockResolvedValueOnce(
        uploadResult,
      );

      // Make the mocked $isImageBlockNode return true so the success branch
      // walks into the ImageBlock writable assignment path.
      const { $isImageBlockNode } = await import(
        '../nodes/ImageBlockNode/ImageBlockNode'
      );
      ($isImageBlockNode as unknown as Mock).mockReturnValue(true);

      // Capture the writable target so we can assert __objectId was set.
      const writableTarget: Record<string, unknown> = {};
      (mockNode.getWritable as Mock).mockReturnValue(writableTarget);

      render(<DragDropPastePlugin />);

      const dropHandler = getRegisteredHandler(DROP_COMMAND);
      const file = new File(['content'], 'test.png', { type: 'image/png' });
      const event = {
        dataTransfer: { files: [file] },
        preventDefault: vi.fn(),
      };
      await dropHandler(event);

      // Wait for the async upload + post-success editor.update chain.
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(writableTarget.__src).toBe(uploadResult.url);
      expect(writableTarget.__status).toBe('uploaded');
      expect(writableTarget.__objectId).toBe('obj-uuid-123');
    });

    it('does not write `__objectId` when the adapter result omits it (STORAGE-10 legacy adapter compatibility)', async () => {
      const uploadResult = {
        url: 'https://example.com/uploaded.png',
        mime: 'image/png',
        size: 1024,
        // no objectId
      };
      mockMediaConfig.uploadAdapter.uploadFile.mockResolvedValueOnce(
        uploadResult,
      );

      const { $isImageBlockNode } = await import(
        '../nodes/ImageBlockNode/ImageBlockNode'
      );
      ($isImageBlockNode as unknown as Mock).mockReturnValue(true);

      const writableTarget: Record<string, unknown> = {};
      (mockNode.getWritable as Mock).mockReturnValue(writableTarget);

      render(<DragDropPastePlugin />);

      const dropHandler = getRegisteredHandler(DROP_COMMAND);
      const file = new File(['content'], 'test.png', { type: 'image/png' });
      const event = {
        dataTransfer: { files: [file] },
        preventDefault: vi.fn(),
      };
      await dropHandler(event);
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(writableTarget.__src).toBe(uploadResult.url);
      expect(writableTarget.__status).toBe('uploaded');
      expect(writableTarget).not.toHaveProperty('__objectId');
    });
  });
});
