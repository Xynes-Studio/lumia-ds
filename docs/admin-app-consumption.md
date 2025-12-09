# Consuming Lumia DS in an Admin App

Step-by-step guide (React docs style) for wiring Lumia packages into a React/Next.js admin surface with Tailwind, theming, and schema-driven pages.

## Prerequisites

- React 18+, `react-dom`, `react-hook-form`
- Tailwind (`tailwindcss`, `postcss`, `autoprefixer`)
- Familiarity with React component composition and basic Tailwind usage

## Step 1: Install the Lumia packages

```bash
pnpm add @lumia/tokens @lumia/theme @lumia/components @lumia/forms @lumia/layout @lumia/runtime react-hook-form
pnpm add -D tailwindcss postcss autoprefixer
```

## Step 2: Configure Tailwind with the Lumia preset

Use the preset from `@lumia/theme` so Tailwind picks up token-driven CSS variables.

```js
// tailwind.config.cjs
const { lumiaTailwindPreset } = require('@lumia/theme');

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
import { ThemeProvider } from '@lumia/theme';

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
} from '@lumia/runtime';
import { required } from '@lumia/forms';
import { ThemeProvider } from '@lumia/theme';
import { defaultTheme } from '@lumia/tokens';

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

- Lumia packages installed (`@lumia/tokens`, `@lumia/theme`, `@lumia/components`, `@lumia/forms`, `@lumia/layout`, `@lumia/runtime`).
- Tailwind reads token-driven CSS variables from `ThemeProvider` through the Lumia preset.
- The app is wrapped in `ThemeProvider` so DS components and layouts render correctly.
- `defineResource` plus `PageSchema` describe the resource and screens.
- `ResourcePageRenderer` stitches together list/form blocks with mocked data.
