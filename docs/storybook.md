# Storybook – Lumia DS

Repo-level Storybook for documenting and manually testing Lumia primitives and runtime blocks.

## Prerequisites
- Node 18+
- pnpm (`corepack enable`)
- Install once from repo root: `pnpm install`

## Run Storybook

```bash
STORYBOOK_DISABLE_TELEMETRY=1 pnpm storybook
```

- Defaults to port 6006; override with `-p 6007` etc.

## Build static Storybook

```bash
STORYBOOK_DISABLE_TELEMETRY=1 pnpm storybook:build
```

- Outputs to `storybook-static/` at repo root.

## Theming and styling

- Global preview wraps stories in `ThemeProvider` with `defaultTheme`.
- Tailwind utilities come from the `@lumia/theme` preset via `tailwind.config.cjs`; `@tailwind base/components/utilities` are pulled through `.storybook/preview.css`.
- Story sources live under `packages/components/src/**` and `packages/runtime/src/**`.

## Troubleshooting

- **Deps missing**: run `pnpm install` from repo root.
- **Port in use**: pass `-p <port>` to the dev command.
- **CSS not applying**: ensure Tailwind/PostCSS config files exist at repo root and `preview.css` is imported in `.storybook/preview.tsx`.
