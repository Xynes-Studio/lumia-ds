# @lumia-ui/runtime

Runtime schema definitions and renderer for Lumia page rendering.

## Install

```bash
pnpm add @lumia-ui/runtime @lumia-ui/components @lumia-ui/forms @lumia-ui/layout
```

## Features

- **Page Schema**: Zod schemas for validating complete page configurations.
- **Renderer**: React components to render pages from schemas.
- **Resource Management**: Utilities for managing resource configurations.

## Usage

```tsx
import { ResourcePageRenderer } from '@lumia-ui/runtime';

// ...
<ResourcePageRenderer
  resource={resourceConfig}
  page={pageSchema}
  dataSources={data}
  screen="list"
/>
```
