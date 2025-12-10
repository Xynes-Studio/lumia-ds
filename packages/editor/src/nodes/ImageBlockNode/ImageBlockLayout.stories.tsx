import type { Meta, StoryObj } from '@storybook/react';
import { ImageBlockNode } from './ImageBlockNode';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { $createImageBlockNode } from './ImageBlockNode';
import { $insertNodes } from 'lexical';

const meta: Meta = {
  title: 'Nodes/ImageBlock/Layout',
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: '800px',
          maxWidth: '100%',
          border: '1px solid #ddd',
          padding: '20px',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;

function TestEditor({
  src,
  alt,
  layout,
  width,
}: {
  src: string;
  alt?: string;
  layout?: 'inline' | 'breakout' | 'fullWidth';
  width?: number;
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
        contentEditable={<ContentEditable className="editor-input" />}
        placeholder={null}
        ErrorBoundary={({ children }) => <>{children}</>}
      />
      <TestPlugin src={src} alt={alt} layout={layout} width={width} />
    </LexicalComposer>
  );
}

function TestPlugin({
  src,
  alt,
  layout,
  width,
}: {
  src: string;
  alt?: string;
  layout?: 'inline' | 'breakout' | 'fullWidth';
  width?: number;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      const node = $createImageBlockNode({ src, alt, layout, width });
      $insertNodes([node]);
    });
  }, [editor, src, alt, layout, width]);

  return null;
}

export const Default: StoryObj = {
  render: () => (
    <TestEditor
      src="https://images.unsplash.com/photo-1579353977828-2a4eab540b9a?q=80&w=1000&auto=format&fit=crop"
      alt="Sample Image"
    />
  ),
};

export const Inline50: StoryObj = {
  render: () => (
    <TestEditor
      src="https://images.unsplash.com/photo-1579353977828-2a4eab540b9a?q=80&w=1000&auto=format&fit=crop"
      alt="Sample Image"
      layout="inline"
      width={50}
    />
  ),
};

export const FullWidth: StoryObj = {
  render: () => (
    <TestEditor
      src="https://images.unsplash.com/photo-1579353977828-2a4eab540b9a?q=80&w=1000&auto=format&fit=crop"
      alt="Sample Image"
      layout="fullWidth"
    />
  ),
};
