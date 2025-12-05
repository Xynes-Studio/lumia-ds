import type { Meta, StoryObj } from '@storybook/react';
import { ImageBlockComponent } from './ImageBlockComponent';
import { EditorProvider, useEditorContext } from '../../EditorProvider';
import { $createImageBlockNode } from './ImageBlockNode';
import { $insertNodes } from 'lexical';
import { useEffect } from 'react';

const meta: Meta<typeof ImageBlockComponent> = {
  title: 'Editor/Nodes/ImageBlockComponent',
  component: ImageBlockComponent,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <EditorProvider>
        <div className="w-[800px] border p-4">
          <Story />
        </div>
      </EditorProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ImageBlockComponent>;

// Since ImageBlockComponent requires a nodeKey and context, it's hard to storybook it in isolation
// without a running editor.
// We can mock the context or use a real editor.
// Let's use a real editor and insert the node.

function EditorWithImage({
  src,
  alt,
  caption,
  width,
  height,
}: {
  src: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}) {
  return (
    <EditorProvider>
      <ImageInserterPlugin
        src={src}
        alt={alt}
        caption={caption}
        width={width}
        height={height}
      />
    </EditorProvider>
  );
}

function ImageInserterPlugin({
  src,
  alt,
  caption,
  width,
  height,
}: {
  src: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}) {
  const { editor } = useEditorContext();
  useEffect(() => {
    if (editor) {
      editor.update(() => {
        const node = $createImageBlockNode({
          src,
          alt,
          caption,
          width,
          height,
        });
        $insertNodes([node]);
      });
    }
  }, [editor, src, alt, caption, width, height]);
  return null;
}

// Actually, the component is exported, but it expects to be rendered by Lexical.
// However, we can also just render it if we mock the hooks.
// But useLexicalNodeSelection requires a real node.
// So the best way is to render the Editor with the node.

export const StaticImage: Story = {
  render: () => (
    <EditorWithImage
      src="https://images.unsplash.com/photo-1575936123452-b67c3203c357?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      alt="Sample Image"
      width={500}
      height={300}
    />
  ),
};

export const ImageWithCaption: Story = {
  render: () => (
    <EditorWithImage
      src="https://images.unsplash.com/photo-1575936123452-b67c3203c357?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      alt="Sample Image"
      caption="A beautiful camera lens"
      width={500}
      height={300}
    />
  ),
};
