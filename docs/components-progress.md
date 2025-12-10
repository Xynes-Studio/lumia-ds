# ProgressBar and Spinner (DS-903)

Visual indicators for loading and progress states.

## Exports
- `ProgressBar` from `@lumia-ui/components`.
- `Spinner` from `@lumia-ui/components`.

## Props
- `ProgressBar`: `value: number` (clamped 0-100), `indeterminate?: boolean`, `className?: string`, and standard `HTMLAttributes<HTMLDivElement>` for aria labels and data hooks. Sets `role="progressbar"` with `aria-valuemin`/`aria-valuemax`; `aria-valuenow` is omitted when `indeterminate` is true.
- `Spinner`: `size?: 'sm' | 'md' | 'lg' | number` (default `md`), `className?: string`, plus `HTMLAttributes<HTMLSpanElement>`. Defaults `aria-label` to "Loading" and uses `role="status"` with `aria-live="polite"`. Colors rely on the current text color (tokens via tailwind classes).

## Usage
```tsx
import { ProgressBar, Spinner } from '@lumia-ui/components';

export function SavingState({
  progress,
  busy,
}: {
  progress: number;
  busy: boolean;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4">
      <div className="flex items-center gap-2 text-sm text-foreground">
        {busy ? (
          <Spinner size="sm" aria-label="Saving" />
        ) : (
          <span className="inline-flex h-5 w-5" />
        )}
        <span>{busy ? 'Saving changes...' : 'All changes saved'}</span>
      </div>
      <ProgressBar
        value={busy ? progress : 100}
        indeterminate={busy && progress === 0}
        aria-label="Save progress"
      />
    </div>
  );
}
```

## Notes
- Progress track height is fixed to avoid layout shifts; determinate widths animate smoothly and clamp out-of-range values.
- The spinner reserves space with `inline-flex`/`shrink-0` sizing so swapping it in and out does not bump nearby content.
- Colors stay in sync with design tokens through `text-primary`/`bg-primary`; override with `className` if a different accent is needed.
