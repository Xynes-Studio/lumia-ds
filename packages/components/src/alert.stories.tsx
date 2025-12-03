/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import type { IconId } from '@lumia/icons';
import { Alert } from './alert';
import { Card, CardContent } from './card';
import { Button } from './button';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  tags: ['autodocs'],
  args: {
    variant: 'info',
    title: 'Heads up',
    description:
      'Inline alerts surface contextual feedback without breaking flow.',
    showIcon: true,
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof Alert>;

export const Info: Story = {};

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'All set',
    description: 'Everything saved. You can safely move on to the next step.',
  },
};

export const WarningClosable: Story = {
  args: {
    variant: 'warning',
    title: 'Heads up',
    description: 'Review the highlighted fields before continuing.',
    closable: true,
  },
};

export const ErrorBanner: Story = {
  render: (args) => (
    <div className="w-full max-w-4xl space-y-4">
      <Alert {...args} />
      <div className="rounded-md border border-dashed border-border/70 bg-background/80 p-6 text-sm text-muted-foreground">
        Page content sits below the alert. Use this layout for top-of-page
        status messaging or downtime banners.
      </div>
    </div>
  ),
  args: {
    variant: 'error',
    closable: true,
    title: 'We could not save your changes',
    description: 'Check the inline errors in the form below and try again.',
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Example of the alert acting as a top-of-page banner.',
      },
    },
  },
};

export const InlineCard: Story = {
  render: (args) => (
    <Card className="w-full max-w-xl">
      <CardContent className="space-y-4">
        <Alert {...args} />
        <p className="text-sm text-muted">
          Card content continues underneath without extra spacing. Inline alerts
          work well for contextual warnings inside surfaces.
        </p>
      </CardContent>
    </Card>
  ),
  args: {
    title: 'Limited access',
    description: 'You need admin rights to edit this workspace.',
  },
};

export const Controlled: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true);

    return (
      <div className="w-full max-w-xl space-y-3">
        <Alert {...args} open={open} onOpenChange={setOpen} closable />
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          Reopen alert
        </Button>
      </div>
    );
  },
  args: {
    variant: 'info',
    title: 'Autosave paused',
    description: 'Reconnect to resume syncing changes across devices.',
  },
};

export const CustomIcon: Story = {
  args: {
    title: 'New updates available',
    description: 'We added a few quality-of-life improvements to dashboards.',
    icon: 'sparkle' as IconId,
  },
};
