# Lumia UI Design System

React/Next.js-first design system for admin and internal tools, published as independent NPM packages.

## Packages at a glance

- `@lumia-ui/tokens` – typed theme tokens and helpers
- `@lumia-ui/theme` – `ThemeProvider` and Tailwind preset
- `@lumia-ui/components` – React primitives (buttons, inputs, overlays, tabs, layout helpers)
- `@lumia-ui/forms` – validation rules and React Hook Form wiring
- `@lumia-ui/layout` – admin shells, stack layout, drawer layout
- `@lumia-ui/runtime` – schemas and renderer for resource-driven pages
- `@lumia-ui/icons` – icon registry and generated SVG React components

## Quick start (consumer app)

```bash
pnpm add @lumia-ui/tokens @lumia-ui/theme @lumia-ui/components @lumia-ui/forms @lumia-ui/layout @lumia-ui/runtime @lumia-ui/icons react-hook-form
pnpm add -D tailwindcss postcss autoprefixer
```

```js
// tailwind.config.cjs
const { lumiaTailwindPreset } = require('@lumia-ui/theme');

module.exports = {
  presets: [lumiaTailwindPreset],
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
};
```

```tsx
// app/layout.tsx or src/App.tsx
import { ThemeProvider } from '@lumia-ui/theme';
import { defaultTheme } from '@lumia-ui/tokens';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={defaultTheme}>{children}</ThemeProvider>;
}
```

## Docs and guides

- Storybook usage: `docs/storybook.md`
- Table wrapper usage: `docs/components-table.md`
- Pagination usage: `docs/components-pagination.md`
- Icon import workflow: `docs/icon-import.md`
- Runtime schemas: `docs/runtime-schemas.md`
- Admin app consumption guide: `docs/admin-app-consumption.md`
- **Release process: `docs/release-process.md`**
- QA test plan: `docs/qa-test-plan.md`

## Development

- Install deps: `pnpm install`
- Run Storybook: `STORYBOOK_DISABLE_TELEMETRY=1 pnpm storybook`
- Build packages: `pnpm -r build`

## Resource scaffolding CLI

- Generate a resource: `pnpm --filter @lumia-ui/cli exec lumia-resource <resource-name>`
- Fills `src/resources/<resource>.resource.ts` with a `defineResource` template; add pages, fields, and fetchers, then type-check/build.

## Versioning

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to create changesets and release packages.
