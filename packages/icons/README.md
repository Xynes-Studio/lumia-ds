# @lumia/icons

Icon registry utilities and the `Icon` React component for Lumia DS.

## Base icons

A curated set of Lucide icons is pre-registered:

`home`, `user`, `users`, `settings`, `reports`, `add`, `edit`, `delete`, `filter`, `search`, `check`, `alert`, `info`

## Usage

```tsx
import { Icon } from '@lumia/icons';

export function Example() {
  return (
    <div className="flex items-center gap-2 text-primary-600">
      <Icon id="user" />
      <span>Profile</span>
    </div>
  );
}
```

- `id`: icon id from the registry
- `size` (optional): number, defaults to `24`
- `className` (optional): merged with `fill-current` so color inherits from text

## Registering custom icons

```tsx
import { registerIcon } from '@lumia/icons';

const CustomBell = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M12 2a7 7 0 00-7 7v3l-1.5 2H20.5L19 12V9a7 7 0 00-7-7Z" />
  </svg>
);

registerIcon('bell', CustomBell);
```
