import type { Meta, StoryObj } from '@storybook/react';
import { LumiaEditorPrimitive } from './LumiaEditorPrimitive';
import { useState } from 'react';
import { LumiaEditorStateJSON } from '../types';

const meta: Meta<typeof LumiaEditorPrimitive> = {
    title: 'Editor/LumiaEditorPrimitive',
    component: LumiaEditorPrimitive,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LumiaEditorPrimitive>;

const JsonInOutTemplate = () => {
    const [json, setJson] = useState<LumiaEditorStateJSON | null>(null);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ border: '1px solid #ccc', padding: '10px', minHeight: '200px' }}>
                <LumiaEditorPrimitive
                    value={json}
                    onChange={setJson}
                    placeholder="Type here to see JSON update..."
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
