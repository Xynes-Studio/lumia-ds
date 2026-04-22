# Lumia Docs

This workspace contains the documentation site for the Lumia Design System, built with [Nextra](https://nextra.site).

## Stack

- **Framework**: Next.js 15
- **Documentation**: Nextra 4.x
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

## Structure

- `app/layout.tsx`: Root Nextra 4 layout wiring for the App Router.
- `app/page.mdx`: Documentation homepage content.
- `next.config.mjs`: Next.js + Nextra plugin configuration.
