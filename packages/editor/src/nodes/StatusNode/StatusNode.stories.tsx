import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { LumiaEditor } from '../../lumia-editor';
import { LumiaEditorStateJSON } from '../../types';

const meta: Meta<typeof LumiaEditor> = {
  title: 'Status/Static',
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

// Helper to create a status node JSON
const createStatusNode = (text: string, color: string) => ({
  type: 'status',
  text,
  color,
  version: 1,
});

// Helper to create a text node
const createTextNode = (text: string) => ({
  type: 'text',
  text,
  mode: 'normal',
  detail: 0,
  style: '',
  format: 0,
  version: 1,
});

// Paragraph with inline status nodes
const statusInlineState = {
  root: {
    children: [
      {
        type: 'paragraph',
        children: [
          createTextNode('The task is currently '),
          createStatusNode('In Progress', 'info'),
          createTextNode(' and will be '),
          createStatusNode('Done', 'success'),
          createTextNode(' by end of day.'),
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        textFormat: 0,
        textStyle: '',
      },
      {
        type: 'paragraph',
        children: [
          createTextNode('Build status: '),
          createStatusNode('Passing', 'success'),
          createTextNode(' | Tests: '),
          createStatusNode('Warning', 'warning'),
          createTextNode(' | Deploy: '),
          createStatusNode('Failed', 'error'),
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        textFormat: 0,
        textStyle: '',
      },
      {
        type: 'paragraph',
        children: [
          createTextNode('Review requested: '),
          createStatusNode('Needs Review', 'warning'),
          createTextNode(' → '),
          createStatusNode('Approved', 'success'),
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
    type: 'root',
    version: 1,
  },
} as unknown as LumiaEditorStateJSON;

export const InlinePills: Story = {
  render: () => <EditorWithState initialValue={statusInlineState} />,
  parameters: {
    docs: {
      description: {
        story:
          'Shows status pills inline within paragraph text. Demonstrates info, success, warning, and error variants.',
      },
    },
  },
};

// Single status variants showcase
const variantsState = {
  root: {
    children: [
      {
        type: 'paragraph',
        children: [
          createStatusNode('Success', 'success'),
          createTextNode(' '),
          createStatusNode('Warning', 'warning'),
          createTextNode(' '),
          createStatusNode('Error', 'error'),
          createTextNode(' '),
          createStatusNode('Info', 'info'),
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
    type: 'root',
    version: 1,
  },
} as unknown as LumiaEditorStateJSON;

export const AllVariants: Story = {
  render: () => <EditorWithState initialValue={variantsState} />,
  parameters: {
    docs: {
      description: {
        story:
          'Shows all 4 status variants: success, warning, error, and info.',
      },
    },
  },
};
