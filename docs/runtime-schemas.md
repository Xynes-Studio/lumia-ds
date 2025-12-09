# Runtime Schemas

Types and renderer entry points from `@lumia/runtime` for describing resource-driven pages.

## Core types

- `ComponentKind`: `table | detail | form | card-list | stat`
- `BlockSchema`: `{ id, kind, title?, dataSourceId?, props? }`
- `PageSchema`: `{ id, layout: 'admin-shell' | 'stack' | 'drawer', blocks, grid? }`
- `ResourceConfig<TValues>`: `{ id, pages?, fields?, dataFetcher? }`
- `ResourcePageRefs`: `{ list?, detail?, create?, edit?, update? }`

## Zod Runtime Validation

All core types are backed by Zod schemas for runtime validation. Each schema is named with a `Schema` suffix and exported alongside its inferred TypeScript type.

```typescript
import {
  BlockSchemaSchema,
  PageSchemaSchema,
  ResourceConfigSchema,
  type BlockSchema,
  type PageSchema,
} from '@lumia/runtime';

// Validate server-driven config at runtime
const validateBlockConfig = (input: unknown): BlockSchema => {
  return BlockSchemaSchema.parse(input); // throws ZodError if invalid
};

// Safe parsing (non-throwing)
const result = PageSchemaSchema.safeParse(untrustedData);
if (result.success) {
  const page: PageSchema = result.data;
}
```

### Available Schemas

| Schema | Type | Description |
|--------|------|-------------|
| `ComponentKindSchema` | `ComponentKind` | Valid component kind enum |
| `BlockSchemaSchema` | `BlockSchema` | Block configuration |
| `PageSchemaSchema` | `PageSchema` | Page with layout and blocks |
| `GridPlacementSchema` | `GridPlacement` | Grid placement metadata |
| `PageGridSchema` | `PageGrid` | Grid definition |
| `ResourcePageRefsSchema` | `ResourcePageRefs` | Page references by lifecycle |
| `ResourceConfigSchema` | `ResourceConfigInferred` | Resource configuration |
| `ResourceScreenSchema` | `ResourceScreen` | Screen type enum |
| `DataQueryContextSchema` | `DataQueryContextInferred` | Data fetch context |
| `DataSourceResultSchema` | `DataSourceResultInferred` | Data source result |

## Validation Layer

The runtime package includes a validation layer that wraps config fetches with Zod `safeParse`. This catches invalid server configs before they reach the UI.

### Error Types

| Type | Description |
|------|-------------|
| `PageConfigError` | Invalid page configuration |
| `ResourceConfigError` | Invalid resource configuration |
| `DataSourceError` | Invalid data source result |
| `ConfigValidationIssue` | Single validation issue with path, message, code |

### Validation Functions

```typescript
import {
  validatePageConfig,
  validateResourceConfig,
  validateDataSourceResult,
  formatValidationError,
  type ValidationResult,
  type ConfigError,
} from '@lumia/runtime';

// Validate page config - returns result discriminated union
const result = validatePageConfig(json, 'my-page');
if (!result.success) {
  console.log(formatValidationError(result.error));
  // Page config validation failed for "my-page"
  //   - layout: Required (invalid_type)
}

// Use validated data
const page = result.data;
```

### ResourcePageRenderer Integration

`ResourcePageRenderer` automatically validates:
- Resource config from `getResourceConfig()`
- Page config from `getPageSchema()`
- Data source results from `getDataSource()`
- Individual blocks at render time for graceful degradation

On validation failure, it renders user-friendly error widgets instead of crashing:

**Page-level errors:** Shows `PageErrorWidget` with error details
**Block-level errors:** Shows `BlockErrorWidget` for invalid blocks while valid blocks render normally

## Error Widgets

The runtime includes customizable error widgets for graceful degradation:

### PageErrorWidget

Full-page error widget for page/resource validation failures:

```tsx
import { PageErrorWidget, type PageConfigError } from '@lumia/runtime';

<PageErrorWidget
  error={pageError}
  title="Custom Error Title"       // Optional
  description="Custom message"     // Optional
>
  <button>Retry</button>           // Children slot
</PageErrorWidget>
```

- Uses Lumia `Alert` component with `variant="error"`
- Shows detailed issues in development mode
- Customizable via `title`, `description`, and `children` props

### BlockErrorWidget

Inline placeholder for blocks that fail validation:

```tsx
import { BlockErrorWidget } from '@lumia/runtime';

<BlockErrorWidget
  blockId="block-1"
  blockKind="table"                // Optional
  message="Custom error message"   // Optional
>
  <button>Reload</button>          // Children slot
</BlockErrorWidget>
```

- Maintains grid layout compatibility
- Shows block ID and kind
- Customizable via `message` and `children` props

### Block-Level Validation

Individual blocks are validated at render time using `validateBlock()`:

```typescript
import { validateBlock, type BlockValidationResult } from '@lumia/runtime';

const result: BlockValidationResult = validateBlock(blockJson, 'block-id');
if (result.success) {
  // result.data is the validated BlockSchema
} else {
  // result.error is a BlockConfigError with issues
}
```

This enables graceful degradation: invalid blocks show `BlockErrorWidget` while valid blocks render normally.

## Fixture-Based Schema Testing

JSON fixtures are used to guarantee schema stability and catch breaking changes early. Fixtures live in `src/schemas/__tests__/fixtures/`.

### Available Fixtures

| Fixture | Purpose |
|---------|---------|
| `valid-page.json` | Complete page with blocks and grid |
| `valid-block.json` | Block with all optional fields |
| `valid-resource.json` | Resource with pages and fields |
| `invalid-page-missing-id.json` | Page missing required `id` |
| `invalid-page-bad-layout.json` | Page with invalid layout enum |
| `invalid-block-missing-kind.json` | Block missing required `kind` |
| `invalid-block-wrong-type.json` | Block with invalid kind enum |
| `invalid-resource-missing-id.json` | Resource missing required `id` |

### Using Fixtures

```typescript
import validPage from './fixtures/valid-page.json';
import { PageSchemaSchema } from '@lumia/runtime';

// Test valid fixture passes
const result = PageSchemaSchema.safeParse(validPage);
expect(result.success).toBe(true);

// Test invalid fixture has expected error path
import invalidPage from './fixtures/invalid-page-missing-id.json';
const badResult = PageSchemaSchema.safeParse(invalidPage);
expect(badResult.success).toBe(false);
expect(badResult.error.issues[0].path).toEqual(['id']);
```

### Schema Stability Contract

The fixture tests enforce:
- Required field presence (`id`, `layout`, `blocks`, `kind`)
- Enum value validity (`ComponentKind`, layout types)
- Error path and code accuracy for debugging

CI will fail if schemas change in a way that breaks existing fixtures, ensuring deliberate schema evolution.

## Data fetching contract

- `getResourceConfig(resourceName)` → `ResourceConfig` (required)
- `getPageSchema(pageId)` → `PageSchema` (required)
- `getDataSource?(dataSourceId, context)` → `DataSourceResult` (`records`, `record`, `initialValues`)
- `canAccess?(context)` → boolean/Promise<boolean> for RBAC gating
- `context`: `{ resource, screen: 'list' | 'detail' | 'create' | 'update', params?, permissions? }`

## ResourcePageRenderer

- Resolves the resource, selects the matching page for the screen, runs `canAccess`, fetches data sources, and renders blocks inside the configured layout (`AdminShell | StackLayout | DrawerLayout`).
- Props: `resourceName`, `screen`, `fetcher`, optional `params`, `permissions`.

```tsx
import { ResourcePageRenderer, type DataFetcher } from '@lumia/runtime';

const fetcher: DataFetcher = {
  getResourceConfig: async (name) => resources[name],
  getPageSchema: async (id) => pages[id],
  getDataSource: async (id) => (id === 'users' ? { records: users } : {}),
  canAccess: ({ permissions }) => permissions?.includes('view:users') ?? true,
};

<ResourcePageRenderer
  resourceName="users"
  screen="list"
  permissions={['view:users']}
  fetcher={fetcher}
/>;
```

### Storybook examples

- `Runtime/AdminShell`: layout scaffold with placeholder header/sidebar content.
- `Runtime/StackLayout`: detail page with sticky actions.
- `Runtime/ResourcePageRenderer`: fake fetcher rendering a list screen through schemas.

## Block components

- `ListBlock`: card-wrapped data table; props include `data`, `columns`, optional `title`, `description`, `emptyMessage`; supports virtualized mode when `virtualized: true` in `BlockSchema.props`.
- `DetailBlock`: card-wrapped record view; props `fields`, optional `columns`, `title`, `description`, `emptyMessage`.
- `FormBlock`: card-wrapped form builder using `ResourceConfig.fields` and `react-hook-form`; props `resource`, `mode`, `initialValues`, `submitLabel`, `emptyMessage`, `onSubmit`, `dataFetcher`.
- Blocks are exported from `@lumia/runtime` and can be rendered directly.

```tsx
import {
  DetailBlock,
  FormBlock,
  ListBlock,
  type BlockSchema,
  type DetailBlockProps,
  type FormBlockProps,
  type ListBlockProps,
  type ResourceConfig,
} from '@lumia/runtime';
import { required } from '@lumia/forms';

const listSchema: BlockSchema = {
  id: 'users-table',
  kind: 'table',
  props: {
    title: 'Users',
    columns: [{ key: 'email', label: 'Email' }],
  } satisfies Partial<ListBlockProps>,
};

const detailSchema: BlockSchema = {
  id: 'user-detail',
  kind: 'detail',
  props: {
    title: 'Profile',
    fields: [{ key: 'name', label: 'Name' }],
  } satisfies Partial<DetailBlockProps>,
};

const memberResource: ResourceConfig<{ name: string; role: string }> = {
  id: 'members',
  fields: [
    { name: 'name', label: 'Name', validation: [required('Name required')] },
    {
      name: 'role',
      label: 'Role',
      kind: 'select',
      options: [
        { label: 'Select a role', value: '' },
        { label: 'Admin', value: 'admin' },
      ],
    },
  ],
};

const formSchema: BlockSchema = {
  id: 'member-form',
  kind: 'form',
  props: {
    title: 'Invite member',
    mode: 'create',
    resource: memberResource,
  } satisfies Partial<FormBlockProps>,
};
```
