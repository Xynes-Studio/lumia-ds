/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { Users, Filter, Star } from 'lucide-react';
import { Chip } from './chip';

const meta = {
  title: 'Components/Chip',
  component: Chip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Following',
    size: 'md',
    variant: 'neutral',
  },
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof Chip>;

export const Neutral: Story = {};

export const ActiveAccent: Story = {
  args: {
    children: 'Favorites',
    variant: 'accent',
    toggle: true,
    active: true,
    leadingIcon: <Star className="h-4 w-4" />,
  },
};

export const WithIcon: Story = {
  args: {
    children: 'Following',
    iconName: 'users',
  },
};

export const WithCustomIcon: Story = {
  args: {
    children: 'Favorites',
    icon: <Star className="h-4 w-4" />,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Filter',
    leadingIcon: <Filter className="h-4 w-4" />,
    disabled: true,
  },
};
