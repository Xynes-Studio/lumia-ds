/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, AvatarGroup } from './avatar';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  args: {
    alt: 'Avery Parker',
    src: 'https://avatar.vercel.sh/avery',
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Circular avatar built on the shadcn/Radix foundation with optional grouping, initials fallback, and responsive sizes.',
      },
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {};

export const WithFallback: Story = {
  args: {
    src: undefined,
    fallbackInitials: 'AP',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <div className="flex flex-col items-center gap-2">
        <Avatar size="sm" src="https://avatar.vercel.sh/s-m" alt="S" />
        <p className="text-xs text-muted-foreground">Small</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar size="md" src="https://avatar.vercel.sh/m-d" alt="M" />
        <p className="text-xs text-muted-foreground">Medium</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar size="lg" src="https://avatar.vercel.sh/l-g" alt="L" />
        <p className="text-xs text-muted-foreground">Large</p>
      </div>
    </div>
  ),
};

export const Grouped: Story = {
  render: () => (
    <AvatarGroup
      max={4}
      avatars={[
        { src: 'https://avatar.vercel.sh/alex', alt: 'Alex' },
        { src: 'https://avatar.vercel.sh/harper', alt: 'Harper' },
        { src: 'https://avatar.vercel.sh/jude', alt: 'Jude' },
        { fallbackInitials: 'BK', alt: 'Blair' },
        { fallbackInitials: 'RA', alt: 'Rowan' },
      ]}
    />
  ),
};
