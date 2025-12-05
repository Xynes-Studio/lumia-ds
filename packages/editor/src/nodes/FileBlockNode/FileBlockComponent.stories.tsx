import type { Meta, StoryObj } from '@storybook/react';
import { FileBlockComponent } from './FileBlockComponent';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { FileBlockNode } from './FileBlockNode';

const meta: Meta<typeof FileBlockComponent> = {
  title: 'Editor/Nodes/FileBlockComponent',
  component: FileBlockComponent,
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

      return (
        <LexicalComposer initialConfig={initialConfig}>
          <Story />
        </LexicalComposer>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof FileBlockComponent>;

export const PDF: Story = {
  args: {
    url: 'https://example.com/document.pdf',
    filename: 'document.pdf',
    size: 1024 * 1024 * 2.5, // 2.5 MB
    mime: 'application/pdf',
    nodeKey: '1',
  },
};

export const Image: Story = {
  args: {
    url: 'https://example.com/image.png',
    filename: 'image.png',
    size: 1024 * 500, // 500 KB
    mime: 'image/png',
    nodeKey: '1',
  },
};

export const NoSize: Story = {
  args: {
    url: 'https://example.com/unknown.zip',
    filename: 'unknown.zip',
    mime: 'application/zip',
    nodeKey: '1',
  },
};

export const LongFilename: Story = {
  args: {
    url: 'https://example.com/very-long-filename-that-should-be-truncated-in-the-ui-because-it-is-too-long.txt',
    filename:
      'very-long-filename-that-should-be-truncated-in-the-ui-because-it-is-too-long.txt',
    size: 123,
    mime: 'text/plain',
    nodeKey: '1',
  },
};
