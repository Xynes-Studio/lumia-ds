import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ImageBlockComponent } from './ImageBlockComponent';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ImageBlockNode, ImageBlockAlignment } from './ImageBlockNode';
import { MediaContext } from '../../EditorProvider';
import { EditorMediaConfig } from '../../media-config';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { $createImageBlockNode } from './ImageBlockNode';
import { $getRoot } from 'lexical';

const meta: Meta<typeof ImageBlockComponent> = {
  title: 'Editor/Blocks/Image',
  component: ImageBlockComponent,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => {
      const initialConfig = {
        namespace: 'ImageBlockComponentStory',
        nodes: [ImageBlockNode],
        onError: (error: Error) => console.error(error),
        theme: {
          image: 'editor-image',
        },
      };

      const mediaConfig: EditorMediaConfig = {
        uploadAdapter: {
          uploadFile: async (file) => {
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate delay
            if (file.name.includes('error')) {
              throw new Error('Upload failed');
            }
            return {
              url: URL.createObjectURL(file),
              mime: file.type,
              size: file.size,
            };
          },
        },
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif'],
        maxFileSizeMB: 5,
      };

      return (
        <MediaContext.Provider value={mediaConfig}>
          <LexicalComposer initialConfig={initialConfig}>
            <div className="relative prose dark:prose-invert min-w-[600px] border p-4">
              <Story />
            </div>
          </LexicalComposer>
        </MediaContext.Provider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof ImageBlockComponent>;

import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';

const StoryEditor = ({
  src,
  status,
  alignment,
  width,
}: {
  src: string;
  status?: 'uploading' | 'uploaded' | 'error';
  alignment?: ImageBlockAlignment;
  width?: number;
}) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      $getRoot().clear();
      const node = $createImageBlockNode({ src, status, alignment, width });
      $getRoot().append(node);
    });
  }, [editor, src, status, alignment, width]);

  return (
    <RichTextPlugin
      contentEditable={
        <ContentEditable className="min-h-[200px] outline-none" />
      }
      placeholder={null}
      ErrorBoundary={
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        LexicalErrorBoundary as unknown as React.ComponentType<any>
      }
    />
  );
};

export const UploadState: Story = {
  render: () => <StoryEditor src="" />,
};

export const UploadingState: Story = {
  render: () => (
    <StoryEditor
      src="https://picsum.photos/id/237/500/300"
      status="uploading"
    />
  ),
};

export const ErrorState: Story = {
  render: () => (
    <StoryEditor src="https://picsum.photos/id/237/500/300" status="error" />
  ),
};

export const UploadedState: Story = {
  render: () => (
    <StoryEditor src="https://picsum.photos/id/237/500/300" status="uploaded" />
  ),
};

export const Interactive: Story = {
  render: () => (
    <StoryEditor
      src="https://picsum.photos/id/29/600/400"
      status="uploaded"
      width={400}
      alignment="left"
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Click the image to reveal the floating toolbar. Use the alignment buttons to align the image. Drag the right handle to resize.',
      },
    },
  },
};
