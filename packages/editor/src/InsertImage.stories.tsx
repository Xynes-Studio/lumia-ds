import type { Meta, StoryObj } from '@storybook/react';
import { LumiaEditor } from './lumia-editor/lumia-editor';

const meta: Meta<typeof LumiaEditor> = {
  title: 'Editor/Image/Insert from URL',
  component: LumiaEditor,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof LumiaEditor>;

export const Default: Story = {
  args: {
    placeholder: 'Click the image icon in the toolbar to insert an image...',
  },
};
