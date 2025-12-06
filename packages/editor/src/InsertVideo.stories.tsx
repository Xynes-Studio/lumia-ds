import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { LumiaEditor } from './lumia-editor';
import { LumiaEditorStateJSON } from './types';

const meta: Meta<typeof LumiaEditor> = {
  title: 'Editor/Insert Video',
  component: LumiaEditor,
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = StoryObj<typeof LumiaEditor>;

const EditorWithState = ({
  initialValue,
}: {
  initialValue?: LumiaEditorStateJSON;
}) => {
  const [value, setValue] = useState<LumiaEditorStateJSON | null>(
    initialValue || null,
  );

  return (
    <div className="max-w-4xl mx-auto">
      <LumiaEditor value={value} onChange={setValue} />
      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-gray-500">
          View JSON
        </summary>
        <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-64">
          {JSON.stringify(value, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export const VideoToolbarButton: Story = {
  render: () => <EditorWithState />,
  parameters: {
    docs: {
      description: {
        story: `
## Video Toolbar Button

Click the **Video icon** in the toolbar to open a dialog where you can:

1. Enter a video URL (YouTube, Vimeo, Loom, or direct video file)
2. Optionally override the provider detection
3. Click "Insert" to add the video block

### Supported URLs:
- YouTube: \`https://youtube.com/watch?v=...\` or \`https://youtu.be/...\`
- Vimeo: \`https://vimeo.com/...\`
- Loom: \`https://loom.com/share/...\`
- HTML5: Direct video files (.mp4, .webm, .ogg)
        `,
      },
    },
  },
};

export const SlashMenuVideo: Story = {
  render: () => <EditorWithState />,
  parameters: {
    docs: {
      description: {
        story: `
## Slash Menu for Video

Type **\`/video\`** at the start of a line or after a space to open the slash menu.

1. Type \`/\` to open the menu
2. Select "Video" from the list or type to filter
3. Press Enter and provide the video URL

The slash menu also supports:
- Arrow keys for navigation
- Type to filter commands
- Escape to close
        `,
      },
    },
  },
};

// Pre-seeded with a YouTube video
// Using type assertion for JSON literals that match the serialized format
const youtubeVideoState = {
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'Here is an embedded YouTube video:',
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
        textFormat: 0,
        textStyle: '',
      },
      {
        src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        provider: 'youtube',
        title: 'Embedded Video',
        type: 'video-block',
        version: 1,
      },
      {
        children: [],
        direction: null,
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
        textFormat: 0,
        textStyle: '',
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
} as unknown as LumiaEditorStateJSON;

export const WithYouTubeVideo: Story = {
  render: () => <EditorWithState initialValue={youtubeVideoState} />,
  parameters: {
    docs: {
      description: {
        story: 'Pre-loaded editor with a YouTube video embedded.',
      },
    },
  },
};

// Pre-seeded with a Vimeo video
const vimeoVideoState = {
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'Here is an embedded Vimeo video:',
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
        textFormat: 0,
        textStyle: '',
      },
      {
        src: 'https://vimeo.com/76979871',
        provider: 'vimeo',
        title: 'Embedded Video',
        type: 'video-block',
        version: 1,
      },
      {
        children: [],
        direction: null,
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
        textFormat: 0,
        textStyle: '',
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
} as unknown as LumiaEditorStateJSON;

export const WithVimeoVideo: Story = {
  render: () => <EditorWithState initialValue={vimeoVideoState} />,
  parameters: {
    docs: {
      description: {
        story: 'Pre-loaded editor with a Vimeo video embedded.',
      },
    },
  },
};
