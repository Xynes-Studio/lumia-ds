# Icon import workflow

Convert raw SVG files into React components and register them in `@lumia/icons`.

## Steps

1. Add SVGs to a source folder (default: `packages/icons/raw`). File names become ids (`chat-bubble.svg` → `chat-bubble`).
2. Run the generator:
   ```bash
   pnpm icons:import
   ```
   Runs `lumia-icon-import`, cleans old generated outputs, and writes new components under `packages/icons/src/generated/icons`.
3. Generated exports live in `packages/icons/src/generated/index.ts`, and registration happens in `packages/icons/src/generated/registry.ts`. These files are auto-written—do not edit by hand.

## Use the icons

- Render via `Icon` with registry ids:
  ```tsx
  import { Icon } from '@lumia/icons';

  <Icon id="chat-bubble" size={24} className="text-primary-600" />;
  ```
- Or import generated components directly:
  ```tsx
  import { ChatBubbleIcon } from '@lumia/icons';
  ```

## Notes

- The CLI enforces `viewBox` and `xmlns` defaults if missing.
- JSX props are camelCased (e.g., `stroke-width` → `strokeWidth`) automatically.
- Registries reset when the icons package loads, seeding curated Lucide icons plus generated icons.
