/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { StatusPill } from './status-pill';

const meta = {
  title: 'Components/StatusPill',
  component: StatusPill,
  tags: ['autodocs'],
  args: {
    children: 'In progress',
    variant: 'info',
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Compact status indicator using Lumia tokens for borders/text and tinted semantic backgrounds for contrast.',
      },
    },
  },
} satisfies Meta<typeof StatusPill>;

export default meta;
type Story = StoryObj<typeof StatusPill>;

export const Info: Story = {};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Active',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Pending',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'Failed',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill variant="success">Success</StatusPill>
        <StatusPill variant="warning">Warning</StatusPill>
        <StatusPill variant="error">Error</StatusPill>
        <StatusPill variant="info">Info</StatusPill>
      </div>
      <div className="rounded-lg border border-border bg-background p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">
            Integration health
          </p>
          <StatusPill variant="success">Operational</StatusPill>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Each microservice reports the latest deployment and monitoring state.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <StatusPill variant="info" className="justify-center">
            Syncing
          </StatusPill>
          <StatusPill variant="warning" className="justify-center">
            Degraded
          </StatusPill>
          <StatusPill variant="success" className="justify-center">
            Green
          </StatusPill>
          <StatusPill variant="error" className="justify-center">
            Outage
          </StatusPill>
        </div>
      </div>
    </div>
  ),
};
