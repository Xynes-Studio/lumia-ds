import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ImageBlockNode, $createImageBlockNode } from './ImageBlockNode';
import { $createParagraphNode, $getRoot } from 'lexical';
import React, { useEffect } from 'react';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { MediaContext } from '../../EditorProvider';
import { EditorMediaConfig } from '../../media-config';

// Mock URL.createObjectURL
globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-preview-url');

// Mock dependencies
vi.mock('@lumia/components', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Card: ({ children, className }: any) => (
    <div className={`mock-card ${className}`} data-testid="image-card">
      {children}
    </div>
  ),
}));

function TestEditor({
  src,
  alt,
  caption,
  mediaConfig,
}: {
  src: string;
  alt?: string;
  caption?: string;
  mediaConfig?: EditorMediaConfig;
}) {
  const initialConfig = {
    namespace: 'TestEditor',
    nodes: [ImageBlockNode],
    onError: (error: Error) => console.error(error),
    theme: {
      image: 'editor-image',
    },
  };

  return (
    <MediaContext.Provider value={mediaConfig || null}>
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={null}
          ErrorBoundary={({ children }) => <>{children}</>}
        />
        <TestPlugin src={src} alt={alt} caption={caption} />
      </LexicalComposer>
    </MediaContext.Provider>
  );
}

function TestPlugin({
  src,
  alt,
  caption,
}: {
  src: string;
  alt?: string;
  caption?: string;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      const node = $createImageBlockNode({ src, alt, caption });
      const paragraph = $createParagraphNode();
      paragraph.append(node);
      $getRoot().append(paragraph);
    });
  }, [editor, src, alt, caption]);

  return null;
}

describe('ImageBlockUpload Baseline', () => {
  it('renders image and caption', async () => {
    render(
      <TestEditor
        src="http://example.com/image.jpg"
        alt="Test Image"
        caption="Test Caption"
      />,
    );

    const image = await screen.findByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'http://example.com/image.jpg');
  });
});

describe('ImageBlockUpload', () => {
  it('renders upload button when src is empty and adapter exists', async () => {
    const mockMediaConfig: EditorMediaConfig = {
      uploadAdapter: {
        uploadFile: vi.fn(),
      },
    };

    render(<TestEditor src="" mediaConfig={mockMediaConfig} />);

    expect(await screen.findByText('Upload Image')).toBeInTheDocument();
  });

  it('handles file selection and optimistic preview', async () => {
    const mockUploadFile = vi.fn();
    const mockMediaConfig: EditorMediaConfig = {
      uploadAdapter: {
        uploadFile: mockUploadFile,
      },
      allowedImageTypes: ['image/jpeg', 'image/png'],
    };

    let resolveUpload: (value: unknown) => void;
    mockUploadFile.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUpload = resolve;
        }),
    );

    render(<TestEditor src="" mediaConfig={mockMediaConfig} />);

    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
    const user = userEvent.setup();
    const input = await screen.findByTestId('file-upload-input');

    await user.upload(input, file);

    // Should show preview immediately (optimistic)
    const image = await screen.findByRole('img');
    expect(image).toHaveAttribute('src', 'blob:mock-preview-url');
    expect(image).toHaveClass('opacity-50'); // Uploading state

    // Resolve the upload
    await act(async () => {
      resolveUpload({
        url: 'https://example.com/uploaded.jpg',
        mime: 'image/jpeg',
        size: 1024,
      });
    });

    // Wait for upload to complete
    await waitFor(() => {
      expect(image).toHaveAttribute('src', 'https://example.com/uploaded.jpg');
      expect(image).not.toHaveClass('opacity-50');
    });

    expect(mockUploadFile).toHaveBeenCalledWith(
      file,
      expect.objectContaining({ onProgress: expect.any(Function) }),
    );
  });

  it('handles upload error', async () => {
    const consoleErrorMock = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const mockUploadFile = vi.fn();
    const mockMediaConfig: EditorMediaConfig = {
      uploadAdapter: {
        uploadFile: mockUploadFile,
      },
    };

    mockUploadFile.mockRejectedValue(new Error('Upload failed'));

    render(<TestEditor src="" mediaConfig={mockMediaConfig} />);

    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
    const user = userEvent.setup();
    const input = await screen.findByTestId('file-upload-input');

    await user.upload(input, file);

    await waitFor(() => expect(mockUploadFile).toHaveBeenCalled());

    // Should show error state
    expect(await screen.findByText('Upload Failed')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
    expect(screen.getByText('Remove')).toBeInTheDocument();

    consoleErrorMock.mockRestore();
  });

  it('validates file size', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const mockUploadFile = vi.fn();
    const mockMediaConfig: EditorMediaConfig = {
      uploadAdapter: {
        uploadFile: mockUploadFile,
      },
      maxFileSizeMB: 0.000001, // Very small limit
    };

    render(<TestEditor src="" mediaConfig={mockMediaConfig} />);

    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
    const user = userEvent.setup();
    const input = await screen.findByTestId('file-upload-input');

    await user.upload(input, file);

    await waitFor(() =>
      expect(alertMock).toHaveBeenCalledWith(
        expect.stringContaining('File size exceeds'),
      ),
    );
    expect(mockUploadFile).not.toHaveBeenCalled();
    alertMock.mockRestore();
  });
});
