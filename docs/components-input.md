# Input (DS-1013)

Lumia DS input primitives for text, password, and multiline fields.

## Exports
- `Input`, `Textarea` from `@lumia-ui/components`.

## Usage

```tsx
import { Input, Textarea } from '@lumia-ui/components';

export function ProfileForm() {
  return (
    <div className="space-y-4">
      <Input label="Name" placeholder="Jane Doe" />
      <Input type="email" placeholder="jane@xynes.com" />
      <Input type="password" placeholder="••••••••" />
      <Textarea hint="Share a brief note" defaultValue="Hello!" />
    </div>
  );
}
```

## Password visibility

Use `type="password"` to render a visibility toggle with eye/eye-off icons. The toggle is keyboard accessible and announces itself via `aria-label`.

```tsx
<Input type="password" placeholder="Create a password" />
```

## Notes
- `hint` renders helper text and is wired into `aria-describedby`.
- `invalid` applies error styles and `aria-invalid`.
- `Textarea` supports `autoResize`, `showCount`, and `maxLength`.
