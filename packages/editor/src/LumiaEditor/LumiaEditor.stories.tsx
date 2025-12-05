import type { Meta, StoryObj } from '@storybook/react';
import { LumiaEditor } from '../lumia-editor';

const meta: Meta<typeof LumiaEditor> = {
  title: 'Editor/LumiaEditor',
  component: LumiaEditor,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LumiaEditor>;

export const Default: Story = {
  args: {
    value: null,
    onChange: (val) => console.log('onChange', val),
    mode: 'document',
    variant: 'full',
    readOnly: false,
  },
};
