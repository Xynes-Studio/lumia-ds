/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

const meta = {
  title: 'Components/Popover',
  component: Popover,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <p className="text-sm font-medium leading-5 text-foreground">
            Overlay content
          </p>
          <p className="text-sm leading-5 text-muted-foreground ">
            Use Popover for lightweight surfaces like menus, forms, or pickers.
            It stays anchored to the trigger.
          </p>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
            <Button size="sm">Apply</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const FormField: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Invite teammate</Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-96">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold leading-5 text-foreground">
              Quick invite
            </p>
            <p className="text-sm leading-5 text-muted-foreground ">
              Add people directly from your team roster.
            </p>
          </div>
          <div className="space-y-2">
            <label
              className="text-sm font-medium leading-5 text-foreground"
              htmlFor="invite-email"
            >
              Email
            </label>
            <Input
              id="invite-email"
              type="email"
              placeholder="alex@lumia.design"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm">
              Skip
            </Button>
            <Button size="sm">Send</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const Placement: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="secondary">
            Top start
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" align="start">
          Anchors to different sides.
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="secondary">
            Right
          </Button>
        </PopoverTrigger>
        <PopoverContent side="right">Right aligned content.</PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="secondary">
            Bottom end
          </Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="end">
          Bottom end placement.
        </PopoverContent>
      </Popover>
    </div>
  ),
};
