import type { Meta, StoryObj } from '@storybook/react';
import { BlockInspector } from './BlockInspector';
import { EditorProvider } from '../../EditorProvider';
import { LumiaEditorPrimitive } from '../../internal/LumiaEditorPrimitive';
import { useState } from 'react';
import { LumiaEditorStateJSON } from '../../types';

const meta: Meta<typeof BlockInspector> = {
  title: 'Editor/Features/BlockInspector',
  component: BlockInspector,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BlockInspector>;

const DemoContainer = () => {
  const [json, setJson] = useState<LumiaEditorStateJSON | null>(null);

  return (
    <EditorProvider value={json} onChange={setJson}>
      <div className="flex gap-4 p-4 h-[600px] w-full items-start">
        <div className="flex-1 h-full overflow-hidden border rounded-lg shadow-sm">
          <LumiaEditorPrimitive className="h-full" />
        </div>
        <div className="w-80 shrink-0">
          <BlockInspector className="w-full" />
        </div>
      </div>
    </EditorProvider>
  );
};

export const Default: Story = {
  render: () => <DemoContainer />,
};
