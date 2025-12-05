import type { Meta, StoryObj } from '@storybook/react';
import { LumiaEditor } from '../lumia-editor';
import { useState } from 'react';
import { LumiaEditorStateJSON } from '../types';

const meta: Meta<typeof LumiaEditor> = {
  title: 'Editor/LumiaEditor',
  component: LumiaEditor,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LumiaEditor>;

const JsonInOutTemplate = () => {
  const [json, setJson] = useState<LumiaEditorStateJSON | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          minHeight: '200px',
        }}
      >
        <LumiaEditor
          value={json}
          onChange={setJson}
          // placeholder is not exposed on LumiaEditor props yet, but we can add it or ignore for now
          // LumiaEditorPrimitive has placeholder prop, but LumiaEditor doesn't expose it in interface
          // Wait, LumiaEditorProps doesn't have placeholder.
          // Let's check LumiaEditorProps in lumia-editor.tsx
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

export const JsonInOut: Story = {
  render: () => <JsonInOutTemplate />,
};
