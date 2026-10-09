# Consuming Lumia DS in an Admin App

Step-by-step guide (React docs style) for wiring Lumia packages into a React/Next.js admin surface with Tailwind, theming, and schema-driven pages.

## Prerequisites

- React 18+, `react-dom`, `react-hook-form`
- Tailwind (`tailwindcss`, `postcss`, `autoprefixer`)
- Familiarity with React component composition and basic Tailwind usage

## Step 1: Install the Lumia packages

```bash
pnpm add @lumia-ui/tokens @lumia-ui/theme @lumia-ui/components @lumia-ui/forms @lumia-ui/layout @lumia-ui/runtime react-hook-form
pnpm add -D tailwindcss postcss autoprefixer
```

## Step 2: Configure Tailwind with the Lumia preset

Use the preset from `@lumia-ui/theme` so Tailwind picks up token-driven CSS variables.

```js
// tailwind.config.cjs
const { lumiaTailwindPreset } = require('@lumia-ui/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [lumiaTailwindPreset],
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
};
```

Add the Tailwind layers to your global stylesheet (e.g., `app/globals.css`):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Step 3: Apply `ThemeProvider` at the app root

`ThemeProvider` writes token CSS variables that the Tailwind preset reads.

```tsx
// app/layout.tsx or src/App.tsx
import { ThemeProvider } from '@lumia-ui/theme';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Defaults to "light" theme (sets data-theme="light")
  return <ThemeProvider>{children}</ThemeProvider>;
}
```

## Step 4: Define a resource and render it

Describe your resource with `defineResource`, declare pages, and let `ResourcePageRenderer` handle layout and blocks. Swap `screen` between `list`, `detail`, `create`, and `update`.

```tsx
// app/admin/users/page.tsx
import { useMemo } from 'react';
import {
  ResourcePageRenderer,
  defineResource,
  type DataFetcher,
  type PageSchema,
} from '@lumia-ui/runtime';
import { required } from '@lumia-ui/forms';
import { ThemeProvider } from '@lumia-ui/theme';
import { defaultTheme } from '@lumia-ui/tokens';

const resources = {
  users: defineResource({
    id: 'users',
    pages: { list: 'users:list', create: 'users:create' },
    fields: [
      { name: 'email', label: 'Email', validation: [required('Email is required')] },
      {
        name: 'role',
        label: 'Role',
        kind: 'select',
        options: [
          { label: 'Select a role', value: '' },
          { label: 'Viewer', value: 'viewer' },
          { label: 'Admin', value: 'admin' },
        ],
      },
    ],
  }),
};

const pages: Record<string, PageSchema> = {
  'users:list': {
    id: 'users:list',
    layout: 'admin-shell',
    blocks: [
      {
        id: 'users-table',
        kind: 'table',
        dataSourceId: 'users',
        props: {
          title: 'Users',
          columns: [
            { key: 'email', label: 'Email', field: 'email' },
            { key: 'role', label: 'Role', field: 'role' },
          ],
        },
      },
    ],
  },
  'users:create': {
    id: 'users:create',
    layout: 'drawer',
    blocks: [
      {
        id: 'user-form',
        kind: 'form',
        dataSourceId: 'users',
        props: { title: 'Invite user' },
      },
    ],
  },
};

const fetcher: DataFetcher = {
  getResourceConfig: (name) => resources[name],
  getPageSchema: (id) => pages[id],
  getDataSource: async (id, ctx) => {
    if (id === 'users' && ctx.screen === 'list') {
      return {
        records: [
          { email: 'maria@example.com', role: 'admin' },
          { email: 'chao@example.com', role: 'viewer' },
        ],
      };
    }
    if (id === 'users' && ctx.screen === 'create') {
      return { initialValues: { role: 'viewer' } };
    }
    return {};
  },
  canAccess: ({ permissions }) => permissions?.includes('admin:users') ?? true,
};

export default function UsersPage() {
  const permissions = useMemo(() => ['admin:users'], []);

  return (
    <ThemeProvider theme="light">
      <ResourcePageRenderer
        resourceName="users"
        screen="list"
        permissions={permissions}
        fetcher={fetcher}
      />
    </ThemeProvider>
  );
}
```

### What this gives you

- Lumia packages installed (`@lumia-ui/tokens`, `@lumia-ui/theme`, `@lumia-ui/components`, `@lumia-ui/forms`, `@lumia-ui/layout`, `@lumia-ui/runtime`).
- Tailwind reads token-driven CSS variables from `ThemeProvider` through the Lumia preset.
- The app is wrapped in `ThemeProvider` so DS components and layouts render correctly.
- `defineResource` plus `PageSchema` describe the resource and screens.
- `ResourcePageRenderer` stitches together list/form blocks with mocked data.


## Semantic light/dark surfaces in Tailwind v4 consumers

Import `@lumia-ui/components/semantic.css` once in the app's root stylesheet.
It provides the shared `--colors-*` semantic surfaces, primary/secondary text,
dividers, focus ring, primary action foreground, highlights, and all four Alert
variants. System appearance applies by default; `data-theme="light"` or
`data-theme="dark"` overrides it. Legacy ThemeProvider inline custom variables
retain their precedence.

Map Tailwind v4 names to these variables in `@theme inline`, including
`--color-primary: var(--colors-primary)`,
`--color-on-primary: var(--colors-on-primary)`,
`--color-highlight: var(--colors-highlight)` and
`--color-highlight-foreground: var(--colors-highlightForeground)`.
Existing background/foreground/muted/border mappings use the same contract.
Normal primary/secondary text and semantic highlights must be checked against
actual compiled CSS in both appearances. Highlights need both surface and text;
never use an undefined warning color or rely on browser-default mark styling.

Alert icons inherit their variant's foreground explicitly. Action icons whose
foreground belongs to the containing button should use `color="currentColor"`;
the Icon default remains unchanged for other consumers. Alert consumers that
have not imported the shared stylesheet retain their standalone light fallback.
