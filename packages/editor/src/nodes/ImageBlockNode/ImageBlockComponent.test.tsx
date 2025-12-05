import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ImageBlockNode, $createImageBlockNode } from './ImageBlockNode';
import { $insertNodes } from 'lexical';
import React, { useEffect } from 'react';

// Mock dependencies
vi.mock('@lumia/components', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Card: ({ children, className }: any) => (
    <div className={`mock-card ${className}`} data-testid="image-card">
      {children}
    </div>
  ),
}));

import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { waitFor } from '@testing-library/react';

// Helper component to render the node within Lexical context
function TestEditor({
  src,
  alt,
  caption,
}: {
  src: string;
  alt?: string;
  caption?: string;
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
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={<ContentEditable />}
        placeholder={null}
        ErrorBoundary={({ children }) => <>{children}</>}
      />
      <TestPlugin src={src} alt={alt} caption={caption} />
    </LexicalComposer>
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
      $insertNodes([node]);
    });
  }, [editor, src, alt, caption]);

  return null;
}

// We need to test the component in isolation if possible, or integration test.
// Since the component uses hooks that depend on the node being in the editor state,
// integration test is better.
// However, `ImageBlockComponent` is rendered by `ImageBlockNode.decorate`.
// So we should test that `ImageBlockNode` renders the component.

describe('ImageBlockComponent', () => {
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
    expect(image).toHaveAttribute('alt', 'Test Image');

    const caption = screen.getByText('Test Caption');
    expect(caption).toBeInTheDocument();
  });

  it('toggles selection styling on click', async () => {
    render(
      <TestEditor
        src="http://example.com/image.jpg"
        alt="Test Image"
        caption="Test Caption"
      />,
    );

    const image = await screen.findByRole('img');
    const card = screen.getByTestId('image-card');

    // Initially not selected
    expect(card.className).not.toContain('ring-2');

    // Click to select
    fireEvent.click(image);

    // Wait for selection update
    await waitFor(() => {
      expect(card.className).toContain('ring-2');
    });

    // Click again to deselect (if implemented that way, or click elsewhere)
    // The current implementation:
    // if (event.shiftKey) setSelected(!isSelected)
    // else { clearSelected(); setSelected(true); }
    // So clicking again without shift will just keep it selected (clear then set).
    // To deselect, we usually click outside, but that's handled by other plugins.
    // Let's test shift+click to toggle.

    fireEvent.click(image, { shiftKey: true });

    await waitFor(() => {
      expect(card.className).not.toContain('ring-2');
    });
  });
});
