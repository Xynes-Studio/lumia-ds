/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button/button';
import { Card, CardContent } from '../card/card';
import { ConfirmDialog, useConfirmDialog } from './confirm-dialog';

const meta = {
  title: 'Components/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  args: {
    title: 'Delete project?',
    description:
      'This will remove the project for everyone. You can restore it from the archive for 30 days.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    destructive: true,
  },
  argTypes: {
    onConfirm: { action: 'confirm' },
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

export const Destructive: Story = {
  render: (args) => {
    const dialog = useConfirmDialog();

    return (
      <ConfirmDialog
        {...args}
        {...dialog.dialogProps}
        trigger={<Button variant="destructive">Delete project</Button>}
      />
    );
  },
};

export const PrimaryAction: Story = {
  args: {
    title: 'Enable new workspace?',
    description: 'Collaborators will get early access to the new navigation.',
    confirmLabel: 'Enable',
    destructive: false,
  },
  render: (args) => {
    const dialog = useConfirmDialog();

    return (
      <ConfirmDialog
        {...args}
        {...dialog.dialogProps}
        trigger={<Button>Enable preview</Button>}
      />
    );
  },
};

export const Programmatic: Story = {
  render: (args) => {
    const dialog = useConfirmDialog();

    return (
      <Card className="w-full max-w-xl">
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use the hook to open and close the confirm dialog from external
            actions.
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={dialog.openDialog}>
              Archive selected
            </Button>
            <Button variant="ghost" onClick={dialog.closeDialog}>
              Close programmatically
            </Button>
          </div>
        </CardContent>
        <ConfirmDialog
          {...args}
          {...dialog.dialogProps}
          title="Archive selected items?"
          description="You can restore them from the archive tab at any time."
          confirmLabel="Archive"
          cancelLabel="Keep items"
          destructive={false}
          onConfirm={args.onConfirm}
        />
      </Card>
    );
  },
  args: {
    destructive: false,
  },
};
