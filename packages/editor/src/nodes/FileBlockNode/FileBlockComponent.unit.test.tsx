import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { FileBlockComponent } from './FileBlockComponent';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { useMediaContext } from '../../EditorProvider';
import {
  $getNodeByKey,
  CLICK_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
} from 'lexical';
import { $isFileBlockNode } from './FileBlockNode';

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
      <div ref={ref} data-testid="file-card" {...props}>
        {children}
      </div>
    ),
  ),
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

vi.mock('./FileBlockNode', () => ({
  $isFileBlockNode: vi.fn(),
}));

describe('FileBlockComponent unit', () => {
  const handlers = new Map<string, (...args: unknown[]) => unknown>();
  const setSelected = vi.fn();
  const clearSelected = vi.fn();
  const writable = {
    __url: '',
    __filename: '',
    __size: 0,
    __mime: '',
    __status: '',
  };
  const node = {
    getWritable: () => writable,
    remove: vi.fn(),
  };
  const uploadFile = vi.fn();
  const onUploadStart = vi.fn();
  const onUploadProgress = vi.fn();
  const onUploadComplete = vi.fn();
  const onUploadError = vi.fn();
  const editor = {
    registerCommand: vi.fn(
      (command: string, handler: (...args: unknown[]) => unknown) => {
        handlers.set(command, handler);
        return vi.fn();
      },
    ),
    update: vi.fn((callback: () => void) => callback()),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    handlers.clear();
    writable.__url = '';
    writable.__filename = '';
    writable.__size = 0;
    writable.__mime = '';
    writable.__status = '';
    (useLexicalComposerContext as Mock).mockReturnValue([editor]);
    (useLexicalNodeSelection as Mock).mockReturnValue([
      false,
      setSelected,
      clearSelected,
    ]);
    (useMediaContext as Mock).mockReturnValue({
      uploadAdapter: {
        uploadFile,
      },
      callbacks: {
        onUploadStart,
        onUploadProgress,
        onUploadComplete,
        onUploadError,
      },
      maxFileSizeMB: 5,
    });
    ($getNodeByKey as Mock).mockReturnValue(node);
    ($isFileBlockNode as Mock).mockReturnValue(true);
    Object.defineProperty(globalThis, 'URL', {
      value: {
        createObjectURL: vi.fn(() => 'blob:file-preview'),
      },
      configurable: true,
    });
  });

  it('selects the card on command clicks and ignores buttons inside the card', () => {
    render(
      <FileBlockComponent
        nodeKey="node-key"
        url="https://cdn.example/report.pdf"
        filename="report.pdf"
        size={1024}
        status="uploaded"
      />,
    );

    const card = screen.getByTestId('file-card');
    const link = screen.getByTitle('Download');

    expect(
      handlers.get(CLICK_COMMAND)?.({ target: card, shiftKey: false }),
    ).toBe(true);
    expect(clearSelected).toHaveBeenCalled();
    expect(setSelected).toHaveBeenCalledWith(true);
    expect(
      handlers.get(CLICK_COMMAND)?.({ target: link, shiftKey: false }),
    ).toBe(false);
  });

  it('removes the node when delete commands fire on a selected file block', () => {
    (useLexicalNodeSelection as Mock).mockReturnValue([
      true,
      setSelected,
      clearSelected,
    ]);

    render(
      <FileBlockComponent
        nodeKey="node-key"
        url="https://cdn.example/report.pdf"
        filename="report.pdf"
        size={1024}
        status="uploaded"
      />,
    );

    const preventDefault = vi.fn();
    expect(handlers.get(KEY_DELETE_COMMAND)?.({ preventDefault })).toBe(true);
    expect(handlers.get(KEY_BACKSPACE_COMMAND)?.({ preventDefault })).toBe(
      true,
    );
    expect(preventDefault).toHaveBeenCalled();
    expect(node.remove).toHaveBeenCalledTimes(2);
  });

  it('uploads a selected file and updates the node on success', async () => {
    uploadFile.mockImplementation(
      async (
        file: File,
        options: {
          onProgress: (progress: number) => void;
        },
      ) => {
        options.onProgress(50);
        return {
          url: 'https://cdn.example/final-report.pdf',
          size: file.size,
          mime: file.type,
        };
      },
    );

    render(
      <FileBlockComponent
        nodeKey="node-key"
        url=""
        filename=""
        size={0}
        status="uploaded"
      />,
    );

    fireEvent.change(screen.getByTestId('file-upload-input'), {
      target: {
        files: [
          new File(['report'], 'report.pdf', { type: 'application/pdf' }),
        ],
      },
    });

    await waitFor(() => {
      expect(onUploadComplete).toHaveBeenCalled();
    });

    expect(onUploadStart).toHaveBeenCalled();
    expect(onUploadProgress).toHaveBeenCalledWith(expect.any(File), 50);
    expect(writable.__url).toBe('https://cdn.example/final-report.pdf');
    expect(writable.__filename).toBe('report.pdf');
    expect(writable.__status).toBe('uploaded');
  });

  it('alerts when the selected upload exceeds the file size limit', () => {
    const alertSpy = vi
      .spyOn(window, 'alert')
      .mockImplementation(() => undefined);
    (useMediaContext as Mock).mockReturnValue({
      uploadAdapter: {
        uploadFile,
      },
      callbacks: {
        onUploadStart,
        onUploadProgress,
        onUploadComplete,
        onUploadError,
      },
      maxFileSizeMB: 0.000001,
    });

    render(
      <FileBlockComponent
        nodeKey="node-key"
        url=""
        filename=""
        size={0}
        status="uploaded"
      />,
    );

    fireEvent.change(screen.getByTestId('file-upload-input'), {
      target: {
        files: [new File(['123456'], 'large.pdf', { type: 'application/pdf' })],
      },
    });

    expect(alertSpy).toHaveBeenCalled();
    expect(uploadFile).not.toHaveBeenCalled();
  });

  it('marks the node as errored when file upload fails and supports retry and remove', async () => {
    uploadFile.mockRejectedValue(new Error('upload failed'));
    const clickSpy = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(() => undefined);

    const { rerender } = render(
      <FileBlockComponent
        nodeKey="node-key"
        url=""
        filename=""
        size={0}
        status="uploaded"
      />,
    );

    fireEvent.change(screen.getByTestId('file-upload-input'), {
      target: {
        files: [
          new File(['report'], 'report.pdf', { type: 'application/pdf' }),
        ],
      },
    });

    await waitFor(() => {
      expect(onUploadError).toHaveBeenCalled();
    });

    expect(writable.__status).toBe('error');

    rerender(
      <FileBlockComponent
        nodeKey="node-key"
        url="blob:file-preview"
        filename="report.pdf"
        size={12}
        status="error"
      />,
    );

    fireEvent.click(screen.getByTitle('Retry'));
    fireEvent.click(screen.getByTitle('Remove'));

    expect(clickSpy).toHaveBeenCalled();
    expect(node.remove).toHaveBeenCalled();
  });
});
