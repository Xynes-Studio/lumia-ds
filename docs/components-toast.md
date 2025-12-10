# Toast (DS-901)

Shadcn/Radix-based toast system for lightweight notifications.

## Exports
- `ToastProvider`, `ToastViewport`, `useToast`, `ToastOptions`, `ToastVariant`, `ToastAction` from `@lumia-ui/components`.

## Props
- `ToastProvider`: accepts Radix `ToastProviderProps` plus `maxVisible?: number` (defaults to 3) to cap stacked toasts. `duration` configures auto-dismiss in milliseconds.
- `useToast().show(options: ToastOptions)` renders a toast. Returns the toast id. `useToast().dismiss(id)` removes it early.
- `ToastOptions`: `title`, optional `description`, `variant?: 'default' | 'success' | 'warning' | 'error'`, optional `action: { label; onClick?; altText? }`, optional `duration` to override the provider default.
- `ToastViewport` is exported for layout overrides but is included by default inside `ToastProvider`.

## Usage
```tsx
import { Button, ToastProvider, useToast } from '@lumia-ui/components';

function SaveButton() {
  const { show } = useToast();

  return (
    <Button
      onClick={() =>
        show({
          title: 'Saved',
          description: 'Settings synced to the cloud.',
          variant: 'success',
          duration: 4000, // optional override
        })
      }
    >
      Save
    </Button>
  );
}

export function Page() {
  return (
    <ToastProvider maxVisible={3}>
      <SaveButton />
      {/* rest of app */}
    </ToastProvider>
  );
}
```

## Notes
- Warnings and errors use `role="alert"`; other variants use `status` for polite announcements.
- Auto-dismiss defaults to 5s. Pass `duration` to the provider or individual toasts to tighten/disable.
- Stacking trims to the latest `maxVisible` toasts; swiping/close control removes individual items while focus remains accessible via Radix primitives.
