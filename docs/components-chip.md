# Chip (DS-1204)

Compact, interactive pill for quick filtering/toggling in dense toolbars and list controls.

This component is distinct from `Tag`:
- `Chip` is interactive (`button`) and intended for actions/toggles.
- `Tag` is a label-style semantic token, optionally removable.

## Export
- `Chip`, `ChipProps`, `ChipVariant`, `ChipSize` from `@lumia-ui/components`.

## Props
- `variant?: 'neutral' | 'accent' | 'warning'` — visual intent, defaults to `neutral`.
- `size?: 'sm' | 'md'` — control density, defaults to `md`.
- `active?: boolean` — visual active state.
- `toggle?: boolean` — when true, applies `aria-pressed` for toggle-button semantics.
- `leadingIcon?: ReactNode` — optional icon slot rendered before label.
- `trailingContent?: ReactNode` — optional right slot (e.g., count badge).
- Inherits native `ButtonHTMLAttributes<HTMLButtonElement>` except native `size`.

## Usage
```tsx
import { Chip } from '@lumia-ui/components';
import { Filter, Star, Users } from 'lucide-react';

export function ToolbarFilters() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Chip leadingIcon={<Users className="h-4 w-4" />}>Following</Chip>

      <Chip
        variant="accent"
        toggle
        active
        leadingIcon={<Star className="h-4 w-4" />}
      >
        Favorites
      </Chip>

      <Chip disabled leadingIcon={<Filter className="h-4 w-4" />}>
        Filter
      </Chip>
    </div>
  );
}
```

## Accessibility
- `Chip` uses native `button` semantics and keyboard activation.
- For toggle behavior, always set `toggle` and manage `active` state so `aria-pressed` is accurate.
- For icon-only usage, provide an accessible name via `aria-label`.
- Focus-visible ring is built in and must not be removed in consuming apps.

## React and Next.js Notes
- Works in both client-rendered React and Next.js app-router client components.
- Avoid passing non-serializable props across server boundaries when used in Next.js Server Components.
- Prefer keeping toggle state in URL or feature state (for filter chips) to support deep-linkable UIs.

## Security Notes
- `Chip` renders plain React children and does not use `dangerouslySetInnerHTML`.
- Keep labels/content trusted or sanitized by caller when deriving from remote input.

## Testing Notes
- Follow ADR-001:
  - Tier 2 integration coverage for interactions and accessibility states.
  - Maintain >= 80% branch and statement coverage for touched modules.
- Current test file:
  - `packages/components/src/chip/chip.test.tsx`

## Composition Guidance
- Use `Chip` for filter chips, quick-toggle chips, and segmented quick actions.
- Use `Tag` for immutable labels and selected tokens.
- Avoid nested interactive controls inside `Chip` children.
