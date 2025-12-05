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

export const Placeholder: Story = {
  args: {
    // Add any required props here once the component is fully implemented
  },
};
