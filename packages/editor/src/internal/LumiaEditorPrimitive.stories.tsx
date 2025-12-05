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

/**
 * Document Full variant - Full toolbar visible at the top with all controls.
 *
 * Features:
 * - Block type dropdown (Paragraph, H1/H2/H3, Code Block)
 * - Font picker combobox
 * - Text formatting (Bold, Italic, Underline, Inline Code, Code Block)
 * - List buttons (Bullet, Numbered)
 * - Link support
 */
const DocumentFullTemplate = () => {
  const [json, setJson] = useState<LumiaEditorStateJSON | null>(null);

  return (
    <div
      style={{
        border: '1px solid #e5e5e5',
        borderRadius: '8px',
        overflow: 'hidden',
        maxWidth: '800px',
      }}
    >
      <LumiaEditor value={json} onChange={setJson} />
    </div>
  );
};

export const DocumentFull: Story = {
  render: () => <DocumentFullTemplate />,
  parameters: {
    docs: {
      description: {
        story:
          'Full toolbar variant with Block Type dropdown, Font picker, text formatting buttons (Bold, Italic, Underline, Code, Code Block), List buttons (Bullet, Numbered), and Link support.',
      },
    },
  },
};

/**
 * Document Compact variant - Simplified toolbar for tight layouts.
 *
 * Features:
 * - Hides Block Type and Font controls
 * - Shows essential formatting: Bold, Italic, Underline
 * - Shows Bullet List
 * - Shows Link
 */
const DocumentCompactTemplate = () => {
  const [json, setJson] = useState<LumiaEditorStateJSON | null>(null);

  return (
    <div
      style={{
        border: '1px solid #e5e5e5',
        borderRadius: '8px',
        overflow: 'hidden',
        maxWidth: '600px', // Smaller width to demonstrate compact layout
      }}
    >
      <LumiaEditor value={json} onChange={setJson} variant="compact" />
    </div>
  );
};

export const DocumentCompact: Story = {
  render: () => <DocumentCompactTemplate />,
  parameters: {
    docs: {
      description: {
        story:
          'Compact toolbar variant for tight layouts. Hides block type and font controls, showing only essential formatting options.',
      },
    },
  },
};
