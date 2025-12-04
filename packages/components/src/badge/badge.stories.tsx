/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: {
    children: 'Badge',
    variant: 'default',
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Compact label pill for counts and statuses. Wraps the shadcn badge base with Lumia tokens for background, border, and text.',
      },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
};

export const Subtle: Story = {
  args: {
    variant: 'subtle',
    children: 'Subtle tone',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Default</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="subtle">Subtle</Badge>
    </div>
  ),
};
