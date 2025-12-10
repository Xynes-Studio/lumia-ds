/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button/button';
import { ToastProvider, useToast } from './toast';

const meta = {
  title: 'Feedback/Toast',
  component: ToastProvider,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof ToastProvider>;

const ToastStoryDemo = () => {
  const { show } = useToast();

  const trigger = (
    variant: 'default' | 'success' | 'warning' | 'error',
    title: string,
    description?: string,
  ) =>
    show({
      title,
      description,
      variant,
      duration: variant === 'error' ? 7000 : 4500,
      action:
        variant === 'warning'
          ? {
              label: 'Review',
              onClick: () => console.log('Review clicked'),
            }
          : undefined,
    });

  return (
    <div className="flex min-h-[320px] items-center justify-center bg-muted/50">
      <div className="space-y-4 rounded-lg border border-border bg-background p-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Toast variants</h2>
          <p className="text-sm text-foreground/70">
            Triggers show different variants, stacking in the top-right corner.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
          <Button
            variant="secondary"
            onClick={() =>
              trigger('default', 'Heads up', 'Background sync in progress.')
            }
          >
            Default
          </Button>
          <Button
            variant="primary"
            onClick={() =>
              trigger('success', 'Saved', 'Profile updated successfully.')
            }
          >
            Success
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              trigger('warning', 'Needs attention', 'Policy review required.')
            }
          >
            Warning
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              trigger('error', 'Failed to save', 'Please retry in a moment.')
            }
          >
            Error
          </Button>
        </div>
        <p className="text-xs text-foreground/60">
          Close from the X button or let auto-dismiss handle it. Warnings/errors
          use `alert` for screen readers; other variants use `status`.
        </p>
      </div>
    </div>
  );
};

export const Playground: Story = {
  render: () => (
    <ToastProvider maxVisible={3}>
      <ToastStoryDemo />
    </ToastProvider>
  ),
};
