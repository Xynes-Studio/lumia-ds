import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { LumiaEditor } from '../../lumia-editor';
import { LumiaEditorStateJSON } from '../../types';

const meta: Meta<typeof LumiaEditor> = {
  title: 'Panel/Static',
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

// Helper to create a panel node JSON
const createPanelNode = (
  variant: string,
  title: string | undefined,
  text: string,
) => ({
  type: 'panel-block',
  variant,
  title,
  icon:
    variant === 'info'
      ? 'info'
      : variant === 'success'
        ? 'check'
        : variant === 'warning'
          ? 'alert-triangle'
          : 'file-text', // Simplified icon logic mapping to what css expects or ignores
  children: [
    {
      type: 'paragraph',
      children: [
        {
          text,
          type: 'text',
          mode: 'normal',
          detail: 0,
          style: '',
          format: 0,
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      textFormat: 0,
      textStyle: '',
    },
  ],
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
});

const panelsState = {
  root: {
    children: [
      createPanelNode(
        'info',
        'Information',
        'This is an info panel. It provides helpful information.',
      ),
      createPanelNode(
        'warning',
        'Warning',
        'This is a warning panel. Be careful!',
      ),
      createPanelNode(
        'success',
        'Success',
        'Operation completed successfully.',
      ),
      createPanelNode(
        'note',
        undefined,
        'This is a note panel without a title.',
      ),
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
} as unknown as LumiaEditorStateJSON;

export const AllVariants: Story = {
  render: () => <EditorWithState initialValue={panelsState} />,
  parameters: {
    docs: {
      description: {
        story:
          'Shows all 4 variants of the Panel block: Info, Warning, Success, and Note.',
      },
    },
  },
};
