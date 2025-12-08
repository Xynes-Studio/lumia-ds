import type { Meta, StoryObj } from '@storybook/react';
import { EditorProvider } from '../../EditorProvider';
import { LumiaEditor } from '../../lumia-editor';
import { LumiaEditorStateJSON } from '../../types';

const meta: Meta<typeof EditorProvider> = {
  title: 'Editor/Nodes/Status Node',
  component: EditorProvider,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof EditorProvider>;

const initialEditorState = {
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'This is a paragraph with some status items: ',
            type: 'text',
            version: 1,
          },
          {
            color: 'success',
            text: 'Done',
            type: 'status-node',
            version: 1,
          },
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: ' and ',
            type: 'text',
            version: 1,
          },
          {
            color: 'warning',
            text: 'In Progress',
            type: 'status-node',
            version: 1,
          },
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: ' and ',
            type: 'text',
            version: 1,
          },
          {
            color: 'error',
            text: 'Blocked',
            type: 'status-node',
            version: 1,
          },
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: '.',
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'Another paragraph with an info status: ',
            type: 'text',
            version: 1,
          },
          {
            color: 'info',
            text: 'Info',
            type: 'status-node',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
};

export const Static: Story = {
  render: () => (
    <div className="p-4 max-w-4xl mx-auto">
      <LumiaEditor
        value={initialEditorState as unknown as LumiaEditorStateJSON}
        onChange={() => {}}
      />
    </div>
  ),
};
