# @lumia/icons

Icon registry utilities and the `Icon` React component for Lumia DS.

## Install

```bash
pnpm add @lumia/icons
```

## Base icons

A curated set of Lucide icons is pre-registered:

`home`, `user`, `users`, `settings`, `reports`, `add`, `edit`, `delete`, `filter`, `search`, `check`, `alert`, `info`

Custom icons generated from raw SVGs are also registered by default:

`sparkle`, `chat-bubble`

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

## Building Icons from SVG

Add SVG files to `packages/icons/svg/` and run:

```bash
pnpm build:icons
```

- Source SVGs: `packages/icons/svg/`
- Generated components: `packages/icons/src/generated/`
- Icons are exported from `@lumia/icons` and auto-registered.

### Direct Import (Tree-Shakable)

```tsx
import { IconCheck, IconSparkle } from '@lumia/icons';

export function Example() {
  return <IconCheck className="text-green-500" />;
}
```

### Via Icon Registry

```tsx
import { Icon } from '@lumia/icons';

export function Example() {
  return <Icon id="icon-check" size={20} />;
}
```

