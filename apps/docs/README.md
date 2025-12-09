# Lumia Docs

This workspace contains the documentation site for the Lumia Design System, built with [Nextra](https://nextra.site).

## Stack

- **Framework**: Next.js 14
- **Documentation**: Nextra 2.x
- **Styling**: Tailwind CSS (if configured), Nextra default theme
- **Deployment**: Static export (`next build && next export` via Nextra)

## Development

Run the development server:

```bash
pnpm dev
# OR from root
lumia docs dev
```

## Build

Build the static site:

```bash
pnpm build
# OR from root
lumia docs build
```

## structure

- `pages/` - Content files (`.md`, `.mdx`, `.tsx`). File system routing applies.
- `theme.config.jsx` - Nextra theme configuration.
- `next.config.js` - Next.js configuration.
