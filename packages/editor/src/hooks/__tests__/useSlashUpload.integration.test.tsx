import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { useSlashUpload } from '../useSlashUpload';
import { renderWithEditor } from '../../test-utils/LexicalTestHarness';
import { EditorMediaConfig } from '../../media-config';
import { $getRoot } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

// eslint-disable-next-line no-undef
global.URL.createObjectURL = vi.fn(() => 'blob:test-url');

const TestComponent = ({
  mediaConfig,
  trigger,
}: {
  mediaConfig: EditorMediaConfig;
  trigger: 'image' | 'video' | 'file';
}) => {
  const [editor] = useLexicalComposerContext();
  const { uploadImage, uploadVideo, uploadFile } = useSlashUpload(
    editor,
    mediaConfig,
  );

  return (
    <button
      onClick={() => {
        const file = new File(
          ['content'],
          `test.${trigger === 'image' ? 'jpg' : trigger === 'video' ? 'mp4' : 'pdf'}`,
          {
            type:
              trigger === 'image'
                ? 'image/jpeg'
                : trigger === 'video'
                  ? 'video/mp4'
                  : 'application/pdf',
          },
        );
        if (trigger === 'image') uploadImage(file);
        if (trigger === 'video') uploadVideo(file);
        if (trigger === 'file') uploadFile(file);
      }}
      data-testid="upload-button"
    >
      Upload
    </button>
  );
};

describe('useSlashUpload Integration', () => {
  const mockUploadAdapter = {
    uploadFile: vi.fn(),
  };

  const mockCallbacks = {
    onUploadStart: vi.fn(),
  };

  const mediaConfig: EditorMediaConfig = {
    uploadAdapter: mockUploadAdapter,
    callbacks: mockCallbacks,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uploadImage inserts ImageBlockNode', async () => {
    const { editor } = renderWithEditor(
      <TestComponent mediaConfig={mediaConfig} trigger="image" />,
    );

    const button = screen.getByTestId('upload-button');
    fireEvent.click(button);

    await waitFor(() => {
      editor.getEditorState().read(() => {
        const root = $getRoot();
        let imageNode;
        root.getChildren().forEach((node) => {
          if (node.getType() === 'image-block') imageNode = node;
          if (node.getType() === 'paragraph') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const child = (node as any)
              .getChildren()
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .find((n: any) => n.getType() === 'image-block');
            if (child) imageNode = child;
          }
        });
        expect(imageNode).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((imageNode as any).__src).toBe('blob:test-url');
      });
    });

    expect(mockCallbacks.onUploadStart).toHaveBeenCalledWith(
      expect.any(File),
      'image',
    );
  });

  it('uploadVideo inserts VideoBlockNode', async () => {
    const { editor } = renderWithEditor(
      <TestComponent mediaConfig={mediaConfig} trigger="video" />,
    );

    const button = screen.getByTestId('upload-button');
    fireEvent.click(button);

    await waitFor(() => {
      editor.getEditorState().read(() => {
        const root = $getRoot();
        const videoNode = root
          .getChildren()
          .find((n) => n.getType() === 'video-block');
        expect(videoNode).toBeDefined();
      });
    });

    expect(mockCallbacks.onUploadStart).toHaveBeenCalledWith(
      expect.any(File),
      'video',
    );
  });

  it('uploadFile inserts FileBlockNode', async () => {
    const { editor } = renderWithEditor(
      <TestComponent mediaConfig={mediaConfig} trigger="file" />,
    );

    const button = screen.getByTestId('upload-button');
    fireEvent.click(button);

    await waitFor(() => {
      editor.getEditorState().read(() => {
        const root = $getRoot();
        let fileNode;
        root.getChildren().forEach((node) => {
          if (node.getType() === 'file-block') fileNode = node;
          if (node.getType() === 'paragraph') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const child = (node as any)
              .getChildren()
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .find((n: any) => n.getType() === 'file-block');
            if (child) fileNode = child;
          }
        });
        expect(fileNode).toBeDefined();
      });
    });

    expect(mockCallbacks.onUploadStart).toHaveBeenCalledWith(
      expect.any(File),
      'file',
    );
  });
});
