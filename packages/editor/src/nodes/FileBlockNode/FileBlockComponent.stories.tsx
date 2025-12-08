import React, { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FileBlockComponent } from './FileBlockComponent';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { FileBlockNode, $createFileBlockNode } from './FileBlockNode';
import { MediaContext } from '../../EditorProvider';
import { EditorMediaConfig } from '../../media-config';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

const meta: Meta<typeof FileBlockComponent> = {
  title: 'Nodes/FileBlockComponent',
  component: FileBlockComponent,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => {
      const initialConfig = {
        namespace: 'FileBlockComponentStory',
        nodes: [FileBlockNode],
        onError: (error: Error) => console.error(error),
        theme: {
          file: 'editor-file',
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
        maxFileSizeMB: 5,
      };

      return (
        <MediaContext.Provider value={mediaConfig}>
          <LexicalComposer initialConfig={initialConfig}>
            <div className="relative prose dark:prose-invert p-4 w-[500px]">
              <Story />
            </div>
          </LexicalComposer>
        </MediaContext.Provider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof FileBlockComponent>;

const StoryEditor = ({
  url,
  filename,
  size,
  mime,
  status,
}: {
  url: string;
  filename: string;
  size?: number;
  mime?: string;
  status?: 'uploading' | 'uploaded' | 'error';
}) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      $getRoot().clear();
      const node = $createFileBlockNode({ url, filename, size, mime, status });
      $getRoot().append(node);
    });
  }, [editor, url, filename, size, mime, status]);

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

export const Default: Story = {
  render: () => (
    <StoryEditor
      url="https://example.com/file.pdf"
      filename="example-document.pdf"
      size={1024 * 1024 * 2.5}
      mime="application/pdf"
    />
  ),
};

export const Uploading: Story = {
  render: () => (
    <StoryEditor
      url=""
      filename="uploading-file.pdf"
      size={1024 * 1024 * 5}
      mime="application/pdf"
      status="uploading"
    />
  ),
};

export const Error: Story = {
  render: () => (
    <StoryEditor
      url=""
      filename="failed-upload.pdf"
      size={1024 * 1024 * 1}
      mime="application/pdf"
      status="error"
    />
  ),
};

export const UploadFlow: Story = {
  render: () => <StoryEditor url="" filename="" status={undefined} />,
};
