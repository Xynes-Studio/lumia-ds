/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

const meta = {
  title: 'Components/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof Dialog>;

const DialogBody = () => (
  <>
    <DialogHeader>
      <DialogTitle>Dialog title</DialogTitle>
      <DialogDescription>
        Short description to explain the context for this dialog.
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-3 text-sm leading-6 text-foreground/90">
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi.
        Pellentesque habitant morbi tristique senectus.
      </p>
      <p>
        Use the footer buttons to act or cancel. Click outside or press ESC to
        dismiss.
      </p>
    </div>
    <DialogFooter>
      <Button variant="secondary">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </>
);

export const Triggered: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogBody />
      </DialogContent>
    </Dialog>
  ),
};

export const OpenByDefault: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogTrigger asChild>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogBody />
      </DialogContent>
    </Dialog>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Starts open to inspect overlay, focus ring, and close affordances without extra clicks.',
      },
    },
  },
};
