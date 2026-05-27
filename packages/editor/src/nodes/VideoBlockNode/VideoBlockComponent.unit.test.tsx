import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { VideoBlockComponent } from './VideoBlockComponent';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { useMediaContext } from '../../EditorProvider';
import {
  $getNodeByKey,
  CLICK_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
} from 'lexical';
import { $isVideoBlockNode } from './VideoBlockNode';

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
      <div ref={ref} data-testid="video-card" {...props}>
        {children}
      </div>
    ),
  ),
}));

vi.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader-icon" />,
  Upload: () => <div data-testid="upload-icon" />,
}));

vi.mock('../../components/MediaResizer', () => ({
  MediaResizer: ({
    onWidthChange,
  }: {
    onWidthChange: (width: number) => void;
  }) => <button onClick={() => onWidthChange(640)}>Resize media</button>,
}));

vi.mock('../../components/MediaFloatingToolbar', () => ({
  MediaFloatingToolbar: ({
    onAlignmentChange,
    onDelete,
  }: {
    onAlignmentChange: (alignment: 'center') => void;
    onDelete: () => void;
  }) => (
    <div>
      <button onClick={() => onAlignmentChange('center')}>Align media</button>
      <button onClick={onDelete}>Delete media</button>
    </div>
  ),
}));

vi.mock('../ImageBlockNode/image-layout-utils', () => ({
  getImageLayoutClass: vi.fn(() => 'layout-class'),
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

vi.mock('./VideoBlockNode', () => ({
  $isVideoBlockNode: vi.fn(),
}));

describe('VideoBlockComponent unit', () => {
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
    __provider: '',
  };
  const node = {
    getWritable: () => writable,
    remove: vi.fn(),
    setAlignment: vi.fn(),
    setWidth: vi.fn(),
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
  const createObjectURL = vi.fn(() => 'blob:video-preview');
  const revokeObjectURL = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    handlers.clear();
    writable.__src = '';
    writable.__status = '';
    writable.__provider = '';
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
      allowedVideoTypes: ['video/mp4'],
      maxFileSizeMB: 5,
    });
    ($getNodeByKey as Mock).mockReturnValue(node);
    ($isVideoBlockNode as Mock).mockReturnValue(true);
    Object.defineProperty(globalThis, 'URL', {
      value: {
        createObjectURL,
        revokeObjectURL,
      },
      configurable: true,
    });
  });

  it('uploads a video file and updates the node on success', async () => {
    uploadFile.mockImplementation(
      async (
        file: File,
        options: { onProgress: (progress: number) => void },
      ) => {
        options.onProgress(55);
        return { url: 'https://cdn.example/final-video.mp4' };
      },
    );

    render(
      <VideoBlockComponent nodeKey="video-node" src="" status="uploaded" />,
    );

    fireEvent.change(screen.getByTestId('video-upload-input'), {
      target: {
        files: [new File(['video'], 'clip.mp4', { type: 'video/mp4' })],
      },
    });

    await waitFor(() => {
      expect(onUploadComplete).toHaveBeenCalled();
    });

    expect(onUploadStart).toHaveBeenCalledWith(
      expect.any(File),
      'video',
      'file-picker',
    );
    expect(onUploadProgress).toHaveBeenCalledWith(expect.any(File), 55);
    expect(createObjectURL).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:video-preview');
    expect(writable.__src).toBe('https://cdn.example/final-video.mp4');
    expect(writable.__status).toBe('uploaded');
    expect(writable.__provider).toBe('html5');
  });

  it('alerts for invalid video type and oversized files', () => {
    const alertSpy = vi
      .spyOn(window, 'alert')
      .mockImplementation(() => undefined);

    render(
      <VideoBlockComponent nodeKey="video-node" src="" status="uploaded" />,
    );

    const input = screen.getByTestId('video-upload-input');
    fireEvent.change(input, {
      target: {
        files: [new File(['video'], 'clip.mov', { type: 'video/quicktime' })],
      },
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'File type video/quicktime not allowed',
    );

    (useMediaContext as Mock).mockReturnValue({
      uploadAdapter: { uploadFile },
      callbacks: {
        onUploadStart,
        onUploadProgress,
        onUploadComplete,
        onUploadError,
      },
      allowedVideoTypes: ['video/mp4'],
      maxFileSizeMB: 0.000001,
    });

    const { rerender } = render(
      <VideoBlockComponent nodeKey="video-node" src="" status="uploaded" />,
    );
    rerender(
      <VideoBlockComponent nodeKey="video-node" src="" status="uploaded" />,
    );

    fireEvent.change(screen.getAllByTestId('video-upload-input')[1], {
      target: {
        files: [new File(['large'], 'large.mp4', { type: 'video/mp4' })],
      },
    });

    expect(alertSpy).toHaveBeenCalledWith('File size exceeds 0.000001MB');
    expect(uploadFile).not.toHaveBeenCalled();
  });

  it('retries a failed upload with the pending file and can remove the node', async () => {
    uploadFile
      .mockRejectedValueOnce(new Error('upload failed'))
      .mockResolvedValueOnce({ url: 'https://cdn.example/retry-video.mp4' });

    const { rerender } = render(
      <VideoBlockComponent nodeKey="video-node" src="" status="uploaded" />,
    );

    fireEvent.change(screen.getByTestId('video-upload-input'), {
      target: {
        files: [new File(['video'], 'clip.mp4', { type: 'video/mp4' })],
      },
    });

    await waitFor(() => {
      expect(onUploadError).toHaveBeenCalled();
    });

    rerender(
      <VideoBlockComponent
        nodeKey="video-node"
        src="blob:video-preview"
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

  it('falls back to the file picker when retry has no pending file', () => {
    const clickSpy = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(() => undefined);

    render(
      <VideoBlockComponent
        nodeKey="video-node"
        src="https://cdn.example/video.mp4"
        status="error"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(clickSpy).toHaveBeenCalled();
  });

  it('handles selection, toolbar actions, and delete commands for an inserted video', () => {
    (useLexicalNodeSelection as Mock).mockReturnValue([
      true,
      setSelected,
      clearSelected,
    ]);

    render(
      <VideoBlockComponent
        nodeKey="video-node"
        src="https://cdn.example/video.mp4"
        title="Video"
        status="uploaded"
        width={320}
        alignment="left"
      />,
    );

    fireEvent.click(screen.getByText('Align media'));
    fireEvent.click(screen.getByText('Resize media'));
    fireEvent.click(screen.getByText('Delete media'));

    const video = screen.getByTitle('Video');
    expect(
      handlers.get(CLICK_COMMAND)?.({ target: video, shiftKey: false }),
    ).toBe(true);
    const preventDefault = vi.fn();
    expect(handlers.get(KEY_DELETE_COMMAND)?.({ preventDefault })).toBe(true);
    expect(handlers.get(KEY_BACKSPACE_COMMAND)?.({ preventDefault })).toBe(
      true,
    );

    expect(node.setAlignment).toHaveBeenCalledWith('center');
    expect(node.setWidth).toHaveBeenCalledWith(640);
    expect(node.remove).toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalled();
  });
});
