import type { Meta, StoryObj } from '@storybook/react';
import { InternalLexicalEditor } from './InternalLexicalEditor';

const meta: Meta<typeof InternalLexicalEditor> = {
  title: 'Editor/Internal/LexicalBase',
  component: InternalLexicalEditor,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof InternalLexicalEditor>;

export const Default: Story = {
  render: () => (
    <div
      style={{
        border: '1px solid #ccc',
        padding: '10px',
        borderRadius: '4px',
        minWidth: '500px',
        minHeight: '200px',
        fontFamily: 'sans-serif',
      }}
    >
      <style>
        {`
          .editor-input {
            min-height: 150px;
            outline: none;
          }
          .editor-placeholder {
            color: #999;
            position: absolute;
            top: 10px;
            left: 10px;
            pointer-events: none;
          }
          .editor-container {
            position: relative;
          }
        `}
      </style>
      <InternalLexicalEditor />
    </div>
  ),
};
