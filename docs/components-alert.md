# Alert / InlineAlert (DS-902)

Inline alert banners for contextual info, success, warning, and error messaging. Works as a page-top banner or inside surfaces like `Card`.

## Exports
- `Alert` (also exported as `InlineAlert`) from `@lumia-ui/components`.

## Props
- `variant?: 'info' | 'success' | 'warning' | 'error'` (default `info`).
- `title?: string` and `description?: string` for primary copy.
- `icon?: IconId` to override the variant icon; `showIcon?: boolean` to hide it.
- `closable?: boolean` to render a dismiss button.
- `open?: boolean`, `defaultOpen?: boolean`, and `onOpenChange?: (open: boolean) => void` support controlled/uncontrolled visibility; `onClose?: () => void` fires when the close button is pressed.
- `closeButtonLabel?: string` for accessible close text (default “Dismiss alert”).
- `className?: string` plus standard `HTMLAttributes<HTMLDivElement>` passthrough (aria props, data attributes, etc.).
- ARIA role is automatically set to `status` for `info/success` and `alert` for `warning/error`; override with `role` if needed.

## Usage
```tsx
import type { IconId } from '@lumia-ui/icons';
import { Alert, Card, CardContent } from '@lumia-ui/components';

export function PageBanner() {
  return (
    <div className="space-y-4">
      <Alert
        variant="warning"
        title="Limited connectivity"
        description="Some actions may be delayed while we retry."
        closable
      />
      {/* page content */}
    </div>
  );
}

export function InlineInCard() {
  const sparkle = 'sparkle' as IconId;

  return (
    <Card className="max-w-xl">
      <CardContent className="space-y-3">
        <Alert
          variant="info"
          title="New dashboards"
          description="Try the updated filters before sharing."
          icon={sparkle}
        />
        <p className="text-sm text-muted-foreground -foreground">
          Inline alerts sit comfortably inside cards or sections without extra wrappers.
        </p>
      </CardContent>
    </Card>
  );
}
```

## Notes
- Variant defaults include icons: info (info), success (check), warning/error (alert triangle). Pass `icon` to swap or `showIcon={false}` to remove.
- Close button is optional; uncontrolled alerts hide themselves when dismissed, while controlled usage should update `open` via `onOpenChange`.
- Roles switch between `status` and `alert` automatically, keeping screen reader announcements aligned with severity.
