import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { LumiaEditor } from '../lumia-editor';
import { useEditorContext } from '../EditorProvider';

const meta: Meta<typeof LumiaEditor> = {
  title: 'Editor/Features/SelectedBlockTracking',
  component: LumiaEditor,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof LumiaEditor>;

const DebugPanel = () => {
  const { selectedBlock } = useEditorContext();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: '#f5f5f5',
        border: '1px solid #ccc',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        fontFamily: 'monospace',
        zIndex: 1000,
        maxWidth: '300px',
      }}
    >
      <h4 style={{ margin: '0 0 5px', fontSize: '14px' }}>Selected Block</h4>
      {selectedBlock ? (
        <pre style={{ margin: 0, fontSize: '12px' }}>
          {JSON.stringify(selectedBlock, null, 2)}
        </pre>
      ) : (
        <div style={{ fontSize: '12px', color: '#666' }}>
          No selection or not tracking
        </div>
      )}
    </div>
  );
};

export const SelectedBlockTracker: Story = {
  args: {
    value: null,
    onChange: (val) => console.log('onChange', val),
  },
  render: (args) => (
    <div style={{ position: 'relative' }}>
      <LumiaEditor {...args}>
        <DebugPanel />
      </LumiaEditor>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the SelectedBlockTrackerPlugin. A debug panel in the bottom right shows the currently selected top-level block node key and type.',
      },
    },
  },
};
