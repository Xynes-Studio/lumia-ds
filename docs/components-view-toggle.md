# ViewToggle (DS-1203)

Compact grid/list switcher built on the shadcn-style icon button wrapper with clear pressed state and keyboard activation.

## Exports
- `ViewToggle`, `ViewToggleProps`, `ViewMode` from `@lumia-ui/components`.

## Props
- `mode: 'grid' | 'list'` — controlled current view.
- `onChange(mode)` — fires on click or Enter/Space.
- `className?: string` to style the wrapper; `buttonProps?: ButtonHTMLAttributes<HTMLButtonElement>` applies to each icon button (`onClick` is managed internally).
- `aria-label?: string` overrides the group label (defaults to "Toggle view mode").

## Usage
```tsx
import { useState } from 'react';
import { ViewToggle } from '@lumia-ui/components';

export function ViewChooser() {
  const [mode, setMode] = useState<'grid' | 'list'>('grid');

  return (
    <ViewToggle
      mode={mode}
      onChange={setMode}
      aria-label="Toggle results layout"
    />
  );
}
```

## Notes
- Renders two icon buttons registered in the DS icon registry (`layout-grid`, `list`); active state uses `aria-pressed` and `data-state`.
- Keyboard: each button is tabbable; Enter/Space activates without double-firing clicks.
- Focus ring and compact sizing match existing icon button tokens for toolbar alignment.
