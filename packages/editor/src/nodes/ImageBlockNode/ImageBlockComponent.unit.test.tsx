import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { ImageBlockComponent } from './ImageBlockComponent';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { useMediaContext } from '../../EditorProvider';
import {
  $getNodeByKey,
  CLICK_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
} from 'lexical';
import { $isImageBlockNode } from './ImageBlockNode';

vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: vi.fn(),
}));

vi.mock('@lexical/react/useLexicalNodeSelection', () => ({
  useLexicalNodeSelection: vi.fn(),
}));

vi.mock('../../EditorProvider', () => ({
  useMediaContext: vi.fn(),
}));

vi.mock('@lumia-ui/components', () => ({
  Card: React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
    ({ children, ...props }, ref) => (
      <div ref={ref} data-testid="image-card" {...props}>
        {children}
      </div>
    ),
  ),
}));

vi.mock('../../components/MediaResizer', () => ({
  MediaResizer: ({
    onWidthChange,
  }: {
    onWidthChange: (width: number) => void;
  }) => <button onClick={() => onWidthChange(720)}>Resize image</button>,
}));

vi.mock('../../components/MediaFloatingToolbar', () => ({
  MediaFloatingToolbar: ({
    onLayoutChange,
    onAlignmentChange,
    onDelete,
  }: {
    onLayoutChange: (layout: 'fullWidth') => void;
    onAlignmentChange: (alignment: 'right') => void;
    onDelete: () => void;
  }) => (
    <div>
      <button onClick={() => onLayoutChange('fullWidth')}>Change layout</button>
      <button onClick={() => onAlignmentChange('right')}>
        Change alignment
      </button>
      <button onClick={onDelete}>Delete image</button>
    </div>
  ),
}));

vi.mock('./image-layout-utils', () => ({
  getImageLayoutClass: vi.fn(() => 'image-layout-class'),
  getImageContainerStyle: vi.fn(() => ({ maxWidth: '100%' })),
}));

vi.mock('@lexical/utils', () => ({
  mergeRegister:
    (...callbacks: Array<() => void>) =>
    () => {
      callbacks.forEach((callback) => callback());
    },
}));

vi.mock('lexical', () => ({
  $getNodeByKey: vi.fn(),
  CLICK_COMMAND: 'CLICK_COMMAND',
  COMMAND_PRIORITY_LOW: 'low',
  KEY_BACKSPACE_COMMAND: 'KEY_BACKSPACE_COMMAND',
  KEY_DELETE_COMMAND: 'KEY_DELETE_COMMAND',
}));

vi.mock('./ImageBlockNode', () => ({
  $isImageBlockNode: vi.fn(),
}));

describe('ImageBlockComponent unit', () => {
  const handlers = new Map<string, (...args: unknown[]) => unknown>();
  const setSelected = vi.fn();
  const clearSelected = vi.fn();
  const uploadFile = vi.fn();
  const onUploadStart = vi.fn();
  const onUploadProgress = vi.fn();
  const onUploadComplete = vi.fn();
  const onUploadError = vi.fn();
  const writable = {
    __src: '',
    __status: '',
    __caption: '',
    __objectId: undefined as string | undefined,
  };
  const node = {
    getWritable: () => writable,
    remove: vi.fn(),
    setLayout: vi.fn(),
    setAlignment: vi.fn(),
    setWidth: vi.fn(),
    // STORAGE-11: getObjectId is used by the resolveDownloadUrl effect to
    // guard against stale resolution after the node was edited or removed.
    getObjectId: vi.fn((): string | undefined => writable.__objectId),
  };
  const editor = {
    registerCommand: vi.fn(
      (command: string, handler: (...args: unknown[]) => unknown) => {
        handlers.set(command, handler);
        return vi.fn();
      },
    ),
    update: vi.fn((callback: () => void) => callback()),
  };
  const createObjectURL = vi.fn(() => 'blob:image-preview');
  const revokeObjectURL = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    handlers.clear();
    writable.__src = '';
    writable.__status = '';
    writable.__caption = '';
    writable.__objectId = undefined;
    (useLexicalComposerContext as Mock).mockReturnValue([editor]);
    (useLexicalNodeSelection as Mock).mockReturnValue([
      false,
      setSelected,
      clearSelected,
    ]);
    (useMediaContext as Mock).mockReturnValue({
      uploadAdapter: { uploadFile },
      callbacks: {
        onUploadStart,
        onUploadProgress,
        onUploadComplete,
        onUploadError,
      },
      allowedImageTypes: ['image/png'],
      maxFileSizeMB: 5,
    });
    ($getNodeByKey as Mock).mockReturnValue(node);
    ($isImageBlockNode as Mock).mockReturnValue(true);
    Object.defineProperty(globalThis, 'URL', {
      value: {
        createObjectURL,
        revokeObjectURL,
      },
      configurable: true,
    });
  });

  it('uploads an image file and updates the node on success', async () => {
    uploadFile.mockImplementation(
      async (
        file: File,
        options: { onProgress: (progress: number) => void },
      ) => {
        options.onProgress(80);
        return { url: 'https://cdn.example/final-image.png' };
      },
    );

    render(
      <ImageBlockComponent nodeKey="image-node" src="" status="uploaded" />,
    );

    fireEvent.change(screen.getByTestId('file-upload-input'), {
      target: {
        files: [new File(['image'], 'photo.png', { type: 'image/png' })],
      },
    });

    await waitFor(() => {
      expect(onUploadComplete).toHaveBeenCalled();
    });

    expect(onUploadStart).toHaveBeenCalledWith(
      expect.any(File),
      'image',
      'file-picker',
    );
    expect(onUploadProgress).toHaveBeenCalledWith(expect.any(File), 80);
    expect(createObjectURL).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:image-preview');
    expect(writable.__src).toBe('https://cdn.example/final-image.png');
    expect(writable.__status).toBe('uploaded');
  });

  it('alerts for invalid image type and oversized image files', () => {
    const alertSpy = vi
      .spyOn(window, 'alert')
      .mockImplementation(() => undefined);

    render(
      <ImageBlockComponent nodeKey="image-node" src="" status="uploaded" />,
    );

    const input = screen.getByTestId('file-upload-input');
    fireEvent.change(input, {
      target: {
        files: [new File(['image'], 'photo.jpg', { type: 'image/jpeg' })],
      },
    });

    expect(alertSpy).toHaveBeenCalledWith('File type image/jpeg not allowed');

    (useMediaContext as Mock).mockReturnValue({
      uploadAdapter: { uploadFile },
      callbacks: {
        onUploadStart,
        onUploadProgress,
        onUploadComplete,
        onUploadError,
      },
      allowedImageTypes: ['image/png'],
      maxFileSizeMB: 0.000001,
    });

    const { rerender } = render(
      <ImageBlockComponent nodeKey="image-node" src="" status="uploaded" />,
    );
    rerender(
      <ImageBlockComponent nodeKey="image-node" src="" status="uploaded" />,
    );

    fireEvent.change(screen.getAllByTestId('file-upload-input')[1], {
      target: {
        files: [new File(['large'], 'large.png', { type: 'image/png' })],
      },
    });

    expect(alertSpy).toHaveBeenCalledWith('File size exceeds 0.000001MB');
    expect(uploadFile).not.toHaveBeenCalled();
  });

  it('retries a failed image upload with the pending file and can remove the node', async () => {
    uploadFile
      .mockRejectedValueOnce(new Error('upload failed'))
      .mockResolvedValueOnce({ url: 'https://cdn.example/retry-image.png' });

    const { rerender } = render(
      <ImageBlockComponent nodeKey="image-node" src="" status="uploaded" />,
    );

    fireEvent.change(screen.getByTestId('file-upload-input'), {
      target: {
        files: [new File(['image'], 'photo.png', { type: 'image/png' })],
      },
    });

    await waitFor(() => {
      expect(onUploadError).toHaveBeenCalled();
    });

    rerender(
      <ImageBlockComponent
        nodeKey="image-node"
        src="blob:image-preview"
        status="error"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() => {
      expect(uploadFile).toHaveBeenCalledTimes(2);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(node.remove).toHaveBeenCalled();
  });

  it('safely no-ops when retry has no pending image file', () => {
    render(
      <ImageBlockComponent
        nodeKey="image-node"
        src="https://cdn.example/image.png"
        status="error"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(uploadFile).not.toHaveBeenCalled();
    expect(node.remove).not.toHaveBeenCalled();
  });

  it('handles selection, toolbar actions, caption changes, and delete commands', () => {
    (useLexicalNodeSelection as Mock).mockReturnValue([
      true,
      setSelected,
      clearSelected,
    ]);

    render(
      <ImageBlockComponent
        nodeKey="image-node"
        src="https://cdn.example/image.png"
        alt="Image"
        caption="Caption"
        status="uploaded"
        width={300}
        alignment="left"
        layout="inline"
      />,
    );

    fireEvent.click(screen.getByText('Change layout'));
    fireEvent.click(screen.getByText('Change alignment'));
    fireEvent.click(screen.getByText('Resize image'));
    fireEvent.click(screen.getByText('Delete image'));
    fireEvent.change(screen.getByPlaceholderText('Write a caption...'), {
      target: { value: 'Updated caption' },
    });

    const image = screen.getByRole('img');
    expect(
      handlers.get(CLICK_COMMAND)?.({ target: image, shiftKey: false }),
    ).toBe(true);
    const preventDefault = vi.fn();
    expect(handlers.get(KEY_DELETE_COMMAND)?.({ preventDefault })).toBe(true);
    expect(handlers.get(KEY_BACKSPACE_COMMAND)?.({ preventDefault })).toBe(
      true,
    );

    expect(node.setLayout).toHaveBeenCalledWith('fullWidth');
    expect(node.setAlignment).toHaveBeenCalledWith('right');
    expect(node.setWidth).toHaveBeenCalledWith(720);
    expect(writable.__caption).toBe('Updated caption');
    expect(node.remove).toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalled();
  });

  // ─── STORAGE-11: objectId + resolveDownloadUrl ───────────────────────────

  describe('STORAGE-11 storage-backed images', () => {
    it('persists result.objectId on the node after a successful upload', async () => {
      uploadFile.mockResolvedValue({
        url: 'https://signed.example/storage/object',
        mime: 'image/png',
        size: 1024,
        objectId: 'obj_uploaded_123',
      });

      render(
        <ImageBlockComponent nodeKey="image-node" src="" status="uploaded" />,
      );

      fireEvent.change(screen.getByTestId('file-upload-input'), {
        target: {
          files: [new File(['image'], 'photo.png', { type: 'image/png' })],
        },
      });

      await waitFor(() => {
        expect(onUploadComplete).toHaveBeenCalled();
      });

      expect(writable.__src).toBe('https://signed.example/storage/object');
      expect(writable.__objectId).toBe('obj_uploaded_123');
    });

    it('ignores result.objectId when it is missing (back-compat)', async () => {
      uploadFile.mockResolvedValue({
        url: 'https://cdn.example/legacy.png',
        mime: 'image/png',
        size: 256,
      });

      render(
        <ImageBlockComponent nodeKey="image-node" src="" status="uploaded" />,
      );

      fireEvent.change(screen.getByTestId('file-upload-input'), {
        target: {
          files: [new File(['image'], 'photo.png', { type: 'image/png' })],
        },
      });

      await waitFor(() => {
        expect(onUploadComplete).toHaveBeenCalled();
      });

      expect(writable.__src).toBe('https://cdn.example/legacy.png');
      expect(writable.__objectId).toBeUndefined();
    });

    it('ignores result.objectId when it is an empty string (no-op)', async () => {
      uploadFile.mockResolvedValue({
        url: 'https://cdn.example/x.png',
        mime: 'image/png',
        size: 1,
        objectId: '',
      });

      render(
        <ImageBlockComponent nodeKey="image-node" src="" status="uploaded" />,
      );

      fireEvent.change(screen.getByTestId('file-upload-input'), {
        target: {
          files: [new File(['image'], 'photo.png', { type: 'image/png' })],
        },
      });

      await waitFor(() => {
        expect(onUploadComplete).toHaveBeenCalled();
      });

      expect(writable.__objectId).toBeUndefined();
    });

    it('calls resolveDownloadUrl when objectId is present and updates src', async () => {
      const resolveDownloadUrl = vi.fn(
        async (objectId: string) => `https://fresh.example/${objectId}`,
      );
      (useMediaContext as Mock).mockReturnValue({
        uploadAdapter: { uploadFile },
        callbacks: {},
        resolveDownloadUrl,
      });
      writable.__objectId = 'obj_load_me';

      render(
        <ImageBlockComponent
          nodeKey="image-node"
          src=""
          status="uploaded"
          objectId="obj_load_me"
        />,
      );

      await waitFor(() => {
        expect(resolveDownloadUrl).toHaveBeenCalledWith('obj_load_me');
      });

      await waitFor(() => {
        expect(writable.__src).toBe('https://fresh.example/obj_load_me');
      });
    });

    it('does NOT call resolveDownloadUrl when objectId is missing', () => {
      const resolveDownloadUrl = vi.fn();
      (useMediaContext as Mock).mockReturnValue({
        uploadAdapter: { uploadFile },
        callbacks: {},
        resolveDownloadUrl,
      });

      render(
        <ImageBlockComponent
          nodeKey="image-node"
          src="https://cdn.example/legacy.png"
          status="uploaded"
        />,
      );

      expect(resolveDownloadUrl).not.toHaveBeenCalled();
    });

    it('does NOT throw when resolver returns empty string (leaves src alone)', async () => {
      const resolveDownloadUrl = vi.fn(async () => '');
      (useMediaContext as Mock).mockReturnValue({
        uploadAdapter: { uploadFile },
        callbacks: {},
        resolveDownloadUrl,
      });
      writable.__src = 'https://stale.example/cached.png';
      writable.__objectId = 'obj_empty_resolver';

      render(
        <ImageBlockComponent
          nodeKey="image-node"
          src="https://stale.example/cached.png"
          status="uploaded"
          objectId="obj_empty_resolver"
        />,
      );

      await waitFor(() => {
        expect(resolveDownloadUrl).toHaveBeenCalled();
      });

      // src must NOT be wiped to an empty string — degrade gracefully.
      expect(writable.__src).toBe('https://stale.example/cached.png');
    });

    it('swallows resolver rejection — keeps existing src for graceful degradation', async () => {
      const resolveDownloadUrl = vi.fn(async () => {
        throw new Error('resolver outage');
      });
      (useMediaContext as Mock).mockReturnValue({
        uploadAdapter: { uploadFile },
        callbacks: {},
        resolveDownloadUrl,
      });
      writable.__src = 'https://stale.example/cached.png';
      writable.__objectId = 'obj_resolver_throws';

      render(
        <ImageBlockComponent
          nodeKey="image-node"
          src="https://stale.example/cached.png"
          status="uploaded"
          objectId="obj_resolver_throws"
        />,
      );

      await waitFor(() => {
        expect(resolveDownloadUrl).toHaveBeenCalled();
      });

      expect(writable.__src).toBe('https://stale.example/cached.png');
    });

    it('does NOT call resolveDownloadUrl if mediaConfig is missing it', () => {
      (useMediaContext as Mock).mockReturnValue({
        uploadAdapter: { uploadFile },
        callbacks: {},
      });

      render(
        <ImageBlockComponent
          nodeKey="image-node"
          src=""
          status="uploaded"
          objectId="obj_no_resolver"
        />,
      );

      // No throw, no resolution attempt — silent no-op is expected.
      expect(useMediaContext).toHaveBeenCalled();
    });

    it('updates src only when the node still has the same objectId (race guard)', async () => {
      const resolveDownloadUrl = vi.fn(
        async () => 'https://fresh.example/resolved.png',
      );
      (useMediaContext as Mock).mockReturnValue({
        uploadAdapter: { uploadFile },
        callbacks: {},
        resolveDownloadUrl,
      });
      // Simulate a race: between scheduling the effect and the update callback
      // running, the node's objectId changed (user replaced the image).
      writable.__objectId = 'obj_DIFFERENT';

      render(
        <ImageBlockComponent
          nodeKey="image-node"
          src=""
          status="uploaded"
          objectId="obj_original"
        />,
      );

      await waitFor(() => {
        expect(resolveDownloadUrl).toHaveBeenCalledWith('obj_original');
      });

      // node.getObjectId() returns 'obj_DIFFERENT' so the guard rejects the
      // update.
      expect(writable.__src).toBe('');
    });
  });
});

describe('empty src handling (BUG-LDS-6 follow-up — no <img src="">)', () => {
  it('does NOT render an <img> element when src is empty AND no uploader is wired', () => {
    // Reproduces the React-19 / Next-16 console warning that fires when a
    // persisted image-block carries only __objectId and the host page has
    // no uploadAdapter (e.g. BUG-CMS-5 storage feature flag OFF). Without
    // the fix, the component renders <img src="">; with it, a placeholder
    // <div role="img"> renders instead.
    (useMediaContext as Mock).mockReturnValue({
      // No uploadAdapter — so the showUpload Card branch does NOT cover us.
      uploadAdapter: undefined,
      callbacks: {},
      resolveDownloadUrl: undefined,
    });

    const { container } = render(
      <ImageBlockComponent
        nodeKey="image-node"
        src=""
        status="uploaded"
        objectId="obj_no_url_yet"
      />,
    );

    // The placeholder div is present.
    const placeholder = container.querySelector(
      '[data-testid="image-block-placeholder"]',
    );
    expect(placeholder).not.toBeNull();
    expect(placeholder?.getAttribute('role')).toBe('img');

    // No real <img> element is mounted at all (the React-19 warning trigger).
    const img = container.querySelector('img');
    expect(img).toBeNull();
  });

  it('marks the placeholder as aria-busy when an objectId resolver is in flight', () => {
    const resolveDownloadUrl = vi.fn(async () => 'https://fresh.example/url');
    (useMediaContext as Mock).mockReturnValue({
      uploadAdapter: undefined,
      callbacks: {},
      resolveDownloadUrl,
    });

    const { container } = render(
      <ImageBlockComponent
        nodeKey="image-node"
        src=""
        status="uploaded"
        objectId="obj_being_resolved"
      />,
    );

    const placeholder = container.querySelector(
      '[data-testid="image-block-placeholder"]',
    );
    expect(placeholder?.getAttribute('aria-busy')).toBe('true');
    expect(placeholder?.getAttribute('data-resolving')).toBe('true');
  });

  it('renders the real <img> as soon as src is non-empty', () => {
    (useMediaContext as Mock).mockReturnValue({
      uploadAdapter: undefined,
      callbacks: {},
      resolveDownloadUrl: undefined,
    });

    const { container } = render(
      <ImageBlockComponent
        nodeKey="image-node"
        src="https://cdn.example/image.png"
        alt="Example"
        status="uploaded"
      />,
    );

    // No placeholder — the real image takes over.
    expect(
      container.querySelector('[data-testid="image-block-placeholder"]'),
    ).toBeNull();

    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('https://cdn.example/image.png');
    expect(img?.getAttribute('alt')).toBe('Example');
  });
});
