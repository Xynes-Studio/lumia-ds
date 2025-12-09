# Status Pill (DS-1101)

Semantic status label with tinted backgrounds for quick scanning, built on the shadcn badge wrapper.

## Export
- `StatusPill`, `StatusPillVariant` from `@lumia-ui/components`.

## Props
- `children: React.ReactNode` – status text.
- `variant?: 'success' | 'warning' | 'error' | 'info'` – semantic intent, defaults to `info`.
- `className?: string` – tailwind overrides while keeping the pill shape and focus ring.
- Inherits all `HTMLAttributes<HTMLSpanElement>`.

## Usage
```tsx
import { StatusPill } from '@lumia-ui/components';

<StatusPill variant="success">Operational</StatusPill>;
<StatusPill variant="warning">Pending</StatusPill>;
<StatusPill variant="error">Failed</StatusPill>;
<StatusPill variant="info" className="justify-center w-full">Syncing</StatusPill>;
```

## Notes
- Uses Lumia tokens for the focus ring and base text; semantic backgrounds/borders are paired with dark-mode fallbacks for contrast.
- Keep copy short (1–2 words). Add an `aria-label` when the status text is abbreviated.
