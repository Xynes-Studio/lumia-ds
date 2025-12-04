/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from '@lumia/icons';
import { Button } from '../button/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="secondary">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>
          Helpful tooltip text that keeps copy brief.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const IconTrigger: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Star item"
          >
            <Icon id="sparkle" size={18} aria-hidden="true" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          Works with icon-only or custom trigger elements.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const FormField: Story = {
  render: () => (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <label className="text-sm text-foreground" htmlFor="email">
          Email
        </label>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border text-xs font-semibold text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Email help"
            >
              ?
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" align="start">
            We only use this address for account and security updates.
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
};
