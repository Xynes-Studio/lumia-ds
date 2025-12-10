import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { VideoBlockNode, $createVideoBlockNode } from './VideoBlockNode';
import { $insertNodes } from 'lexical';
import React, { useEffect } from 'react';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';

// Mock dependencies
vi.mock('@lumia/components', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Card: ({ children, className, onClick }: any) => (
    <div
      className={`mock-card ${className}`}
      data-testid="video-card"
      onClick={onClick}
    >
      {children}
    </div>
  ),
}));

// Helper component to render the node within Lexical context
function TestEditor({
  src,
  provider,
  title,
  layout,
  width,
  status,
}: {
  src: string;
  provider?: 'youtube' | 'vimeo' | 'html5';
  title?: string;
  layout?: 'inline' | 'breakout' | 'fullWidth';
  width?: number;
  status?: 'uploading' | 'uploaded' | 'error';
}) {
  const initialConfig = {
    namespace: 'TestEditor',
    nodes: [VideoBlockNode],
    onError: (error: Error) => console.error(error),
    theme: {
      video: 'editor-video',
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={<ContentEditable />}
        placeholder={null}
        ErrorBoundary={({ children }) => <>{children}</>}
      />
      <TestPlugin
        src={src}
        provider={provider}
        title={title}
        layout={layout}
        width={width}
        status={status}
      />
    </LexicalComposer>
  );
}

function TestPlugin({
  src,
  provider,
  title,
  layout,
  width,
  status,
}: {
  src: string;
  provider?: 'youtube' | 'vimeo' | 'html5';
  title?: string;
  layout?: 'inline' | 'breakout' | 'fullWidth';
  width?: number;
  status?: 'uploading' | 'uploaded' | 'error';
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      const node = $createVideoBlockNode({
        src,
        provider,
        title,
        layout,
        width,
        status,
      });
      $insertNodes([node]);
    });
  }, [editor, src, provider, title, layout, width, status]);

  return null;
}

describe('VideoBlockComponent', () => {
  it('renders html5 video element with controls', async () => {
    render(
      <TestEditor
        src="http://example.com/video.mp4"
        provider="html5"
        title="Test Video"
      />,
    );

    const video = await screen.findByTitle('Test Video');
    expect(video).toBeInTheDocument();
    expect(video.tagName).toBe('VIDEO');
    expect(video).toHaveAttribute('src', 'http://example.com/video.mp4');
    expect(video).toHaveAttribute('controls');
  });

  it('renders iframe for youtube videos', async () => {
    render(
      <TestEditor
        src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        provider="youtube"
        title="YouTube Video"
      />,
    );

    const iframe = await screen.findByTitle('YouTube Video');
    expect(iframe).toBeInTheDocument();
    expect(iframe.tagName).toBe('IFRAME');
    // Check that the embed URL is generated correctly
    expect(iframe).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
    );
  });

  it('renders iframe for vimeo videos', async () => {
    render(
      <TestEditor
        src="https://vimeo.com/123456789"
        provider="vimeo"
        title="Vimeo Video"
      />,
    );

    const iframe = await screen.findByTitle('Vimeo Video');
    expect(iframe).toBeInTheDocument();
    expect(iframe.tagName).toBe('IFRAME');
    expect(iframe).toHaveAttribute(
      'src',
      'https://player.vimeo.com/video/123456789',
    );
  });

  it('shows loading overlay when status is uploading', async () => {
    render(
      <TestEditor
        src="http://example.com/video.mp4"
        provider="html5"
        status="uploading"
      />,
    );

    // Check for the video with opacity class - we just need to wait for loading
    await screen.findByRole('application', { hidden: true }).catch(() => null);
    // Since video element may not have a role, let's check for the loading spinner class
    const container = document.querySelector('.video-block-container');
    expect(container).toBeInTheDocument();

    // Check for the loader overlay
    const loader = document.querySelector('.animate-spin');
    expect(loader).toBeInTheDocument();
  });

  it('shows error overlay when status is error', async () => {
    render(
      <TestEditor
        src="http://example.com/video.mp4"
        provider="html5"
        status="error"
      />,
    );

    // Check for error message
    const errorMessage = await screen.findByText('Upload Failed');
    expect(errorMessage).toBeInTheDocument();

    // Check for retry and remove buttons
    const retryButton = screen.getByRole('button', { name: /retry/i });
    const removeButton = screen.getByRole('button', { name: /remove/i });
    expect(retryButton).toBeInTheDocument();
    expect(removeButton).toBeInTheDocument();
  });

  it('shows upload prompt when no src is provided', async () => {
    render(<TestEditor src="" provider="html5" />);

    // Check for the upload prompt
    const uploadPrompt = await screen.findByText('No video source provided');
    expect(uploadPrompt).toBeInTheDocument();
  });

  it('toggles selection styling on click', async () => {
    render(
      <TestEditor
        src="http://example.com/video.mp4"
        provider="html5"
        title="Test Video"
      />,
    );

    // Wait for the video to render
    const video = await screen.findByTitle('Test Video');
    expect(video).toBeInTheDocument();

    // Find the container (the one with click handler)
    const container = document.querySelector('.video-block-container');
    expect(container).toBeInTheDocument();

    // Find the inner div that shows selection ring
    const innerDiv = container?.querySelector('.relative.inline-block');
    expect(innerDiv).toBeInTheDocument();

    // Initially not selected
    expect(innerDiv?.className).not.toContain('ring-2');

    // Find and click the clickable overlay (look for cursor-pointer z-10 overlay)
    const overlay = container?.querySelector(
      '.absolute.inset-0.cursor-pointer.z-10',
    );
    expect(overlay).toBeInTheDocument();

    if (overlay) {
      fireEvent.click(overlay);
    }

    // Wait for selection update
    await waitFor(() => {
      expect(innerDiv?.className).toContain('ring-2');
    });
  });
});
