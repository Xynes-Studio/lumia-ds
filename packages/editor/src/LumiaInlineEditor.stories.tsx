import type { Meta, StoryObj } from '@storybook/react';
import { LumiaInlineEditor } from './LumiaInlineEditor';
import { useState } from 'react';
import { LumiaEditorStateJSON } from './types';

const meta: Meta<typeof LumiaInlineEditor> = {
  title: 'Editor/LumiaInlineEditor',
  component: LumiaInlineEditor,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LumiaInlineEditor>;

const InlineEditorTemplate = () => {
  const [json, setJson] = useState<LumiaEditorStateJSON | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div
        style={{
          border: '1px solid #ccc',
          padding: '20px',
          minHeight: '100px',
        }}
      >
        <h3>Inline Editor Demo</h3>
        <p>Click below to edit:</p>
        <LumiaInlineEditor
          value={json}
          onChange={setJson}
          placeholder="Enter title..."
          className="text-2xl font-bold"
        />
      </div>
      <div>
        <h3>JSON Output</h3>
        <textarea
          value={JSON.stringify(json, null, 2)}
          readOnly
          style={{ width: '100%', height: '300px', fontFamily: 'monospace' }}
        />
      </div>
    </div>
  );
};

export const Default: Story = {
  render: () => <InlineEditorTemplate />,
};
