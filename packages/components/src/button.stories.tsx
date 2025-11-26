/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'Click me',
    variant: 'primary',
    size: 'md',
    fullWidth: false,
    disabled: false,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'outline',
        'ghost',
        'destructive',
        'link',
      ],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'icon'],
    },
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof Button>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3 bg-background p-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Hover each button to inspect interactive colors and focus rings.',
      },
    },
  },
};

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3 bg-background p-4">
      <Button>Default</Button>
      <Button className="ring-2 ring-primary-500 ring-offset-2 ring-offset-background">
        Focused
      </Button>
      <Button disabled>Disabled</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Covers default, focus, disabled, and destructive states. Hover to view hover styling.',
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3 bg-background p-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Icon button">
        *
      </Button>
    </div>
  ),
};
