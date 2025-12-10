import type { Meta, StoryObj } from '@storybook/react';
import { LumiaDocument } from './components/LumiaDocument';
import { LumiaEditorStateJSON } from './types';

const sampleJSON: LumiaEditorStateJSON = {
  root: {
    children: [
      {
        type: 'heading',
        tag: 'h1',
        format: 'center',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'text',
            text: 'Lumia Document Renderer',
            format: 0,
            mode: 'normal',
            style: '',
            detail: 0,
            version: 1,
          },
        ],
      },
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'text',
            text: 'This is a test of the ',
            format: 0,
            mode: 'normal',
            style: '',
            detail: 0,
            version: 1,
          },
          {
            type: 'text',
            text: 'read-only renderer',
            format: 1,
            mode: 'normal',
            style: '',
            detail: 0,
            version: 1,
          },
          {
            type: 'text',
            text: '. It supports standard rich text and custom blocks.',
            format: 0,
            mode: 'normal',
            style: '',
            detail: 0,
            version: 1,
          },
        ],
      },
      {
        type: 'panel-block',
        variant: 'info',
        title: 'Information',
        version: 1,
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'This is an info panel with some content.',
                format: 0,
                version: 1,
                mode: 'normal',
                style: '',
                detail: 0,
              },
            ],
            format: '',
            indent: 0,
            version: 1,
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'Here is a status: ',
            format: 0,
            version: 1,
            mode: 'normal',
            style: '',
            detail: 0,
          },
          { type: 'status', text: 'In Progress', color: 'warning', version: 1 },
        ],
        format: '',
        indent: 0,
        version: 1,
      },
      {
        type: 'image-block',
        src: 'https://images.unsplash.com/photo-1579353977828-2a4eab540b9a?w=800&auto=format&fit=crop&q=60',
        alt: 'Sample Image',
        caption: 'A nice gradient image',
        layout: 'inline',
        width: 600,
        height: 400,
        version: 1,
      },
      {
        type: 'code',
        language: 'javascript',
        version: 1,
        children: [
          {
            type: 'text',
            text: 'console.log("Hello World");\nconst x = 10;',
            format: 0,
            mode: 'normal',
            style: '',
            detail: 0,
            version: 1,
          },
        ],
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
} as unknown as LumiaEditorStateJSON;

const meta: Meta<typeof LumiaDocument> = {
  title: 'Renderer/LumiaDocument',
  component: LumiaDocument,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LumiaDocument>;

export const Default: Story = {
  args: {
    value: sampleJSON,
  },
};
