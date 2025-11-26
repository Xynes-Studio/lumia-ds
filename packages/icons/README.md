# @lumia/icons

Icon registry utilities and the `Icon` React component for Lumia DS.

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

## Importing SVGs with the CLI

Run the workspace script to convert raw SVG files into React components and register them:

```bash
pnpm icons:import
```

- Source SVGs live in `packages/icons/raw` (or pass a different folder to `lumia-icon-import`).
- Components are generated under `packages/icons/src/generated/icons` and exported from `@lumia/icons`.
- Registration happens automatically through `packages/icons/src/generated/registry.ts`, so `Icon` can reference the new ids immediately.

The CLI is provided by `@lumia/cli` and can be invoked directly as well:

```bash
node packages/cli/bin/lumia-icon-import.js path/to/svg/folder packages/icons
```
