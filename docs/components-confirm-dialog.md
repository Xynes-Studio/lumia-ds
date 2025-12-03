# ConfirmDialog (DS-905)

Lightweight confirmation wrapper on top of the DS `Dialog` with sensible keyboard defaults (Enter confirms, Esc cancels).

## Exports
- `ConfirmDialog` and `useConfirmDialog` from `@lumia/components`.

## Props
- `title: string` and `description?: string` render the dialog copy.
- `confirmLabel?: string` (default `Confirm`) and `cancelLabel?: string` (default `Cancel`).
- `destructive?: boolean` switches the confirm button to the destructive style; default is primary.
- `onConfirm: () => void | Promise<void>` runs when the confirm action fires; dialog closes after it resolves.
- `trigger?: ReactNode` renders a trigger via `DialogTrigger`.
- `open?: boolean`, `defaultOpen?: boolean`, and `onOpenChange?: (open: boolean) => void` support controlled/uncontrolled usage.
- Inherits remaining `DialogProps` except for `children`.

## Usage
```tsx
import { Button, ConfirmDialog, useConfirmDialog } from '@lumia/components';

export function DeleteProjectButton() {
  const dialog = useConfirmDialog();

  return (
    <ConfirmDialog
      {...dialog.dialogProps}
      title="Delete project?"
      description="This action cannot be undone. You can restore it from the archive for 30 days."
      confirmLabel="Delete"
      cancelLabel="Cancel"
      destructive
      trigger={<Button variant="destructive">Delete project</Button>}
      onConfirm={() => {
        // run deletion logic
      }}
    />
  );
}
```

## Notes
- Confirm button auto-focuses when the dialog opens so pressing Enter activates it.
- Pressing Esc, clicking the overlay, or hitting the cancel button will close the dialog and return focus to the trigger when present.
- Use the `useConfirmDialog` hook for programmatic control (`openDialog`, `closeDialog`, and `dialogProps` for the component).
