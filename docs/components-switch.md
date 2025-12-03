# Switch (DS-1002)

Accessible on/off toggle built on the shadcn/Radix Switch with Lumia tokens for track/knob states.

## Exports
- `Switch`, `SwitchProps` from `@lumia/components`.

## Props
- `checked: boolean` — controlled on/off state.
- `onChange(checked: boolean)` — called on click or keyboard toggle.
- `label?: string` — optional clickable label next to the control.
- Supports standard Radix switch props such as `disabled`, `required`, `name`, `value`, `aria-*`, and `className` for the track.

## Usage
```tsx
import { useState } from 'react';
import { Switch } from '@lumia/components';

export function NotificationsToggle() {
  const [enabled, setEnabled] = useState(false);

  return (
    <Switch
      label="Enable notifications"
      checked={enabled}
      onChange={setEnabled}
      aria-label="Toggle notifications"
    />
  );
}
```

## Notes
- Keyboard: Space and Enter toggle the switch; focus ring and aria-checked mirror state.
- Visuals: Track shifts from muted to primary when on; thumb slides using DS spacing and background tokens.
- Label is optional; when present the entire row remains clickable while respecting disabled tone.
