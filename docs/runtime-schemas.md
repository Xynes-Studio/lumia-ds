# Runtime Schemas & Validation

Comprehensive guide to `@lumia/runtime` schema-driven UI: types, validation, and how to extend safely.

## Table of Contents

1. [Core Types](#core-types)
2. [How Zod Schemas Map to TypeScript Types](#how-zod-schemas-map-to-typescript-types)
3. [Zod Runtime Validation](#zod-runtime-validation)
4. [Validation Layer](#validation-layer)
5. [Error Widgets](#error-widgets)
6. [How to Add a New Block Type](#how-to-add-a-new-block-type)
7. [How to Add a New Field to Existing Schemas](#how-to-add-a-new-field-to-existing-schemas)
8. [How Fallbacks Work](#how-fallbacks-work)
9. [Fixture-Based Schema Testing](#fixture-based-schema-testing)
10. [Troubleshooting Common Errors](#troubleshooting-common-errors)
11. [Data Fetching Contract](#data-fetching-contract)
12. [ResourcePageRenderer](#resourcepagerenderer)
13. [Block Components](#block-components)

---

## Core types

- `ComponentKind`: `table | detail | form | card-list | stat`
- `BlockSchema`: `{ id, kind, title?, dataSourceId?, props? }`
- `PageSchema`: `{ id, layout: 'admin-shell' | 'stack' | 'drawer', blocks, grid? }`
- `ResourceConfig<TValues>`: `{ id, pages?, fields?, dataFetcher? }`
- `ResourcePageRefs`: `{ list?, detail?, create?, edit?, update? }`

---

## How Zod Schemas Map to TypeScript Types

The runtime package uses [Zod](https://zod.dev/) for runtime validation. Each schema follows a consistent pattern where the Zod schema is the single source of truth, and TypeScript types are derived from it using `z.infer<T>`.

### The `z.infer<T>` Pattern

```typescript
import { z } from 'zod';

// 1. Define the Zod schema (source of truth)
export const BlockSchemaSchema = z.object({
  id: z.string(),
  kind: ComponentKindSchema,      // Reference other schemas
  title: z.string().optional(),   // Optional field
  dataSourceId: z.string().optional(),
  props: z.record(z.unknown()).optional(),
});

// 2. Derive the TypeScript type from the schema
export type BlockSchema = z.infer<typeof BlockSchemaSchema>;

// BlockSchema is equivalent to:
// {
//   id: string;
//   kind: 'table' | 'detail' | 'form' | 'card-list' | 'stat';
//   title?: string | undefined;
//   dataSourceId?: string | undefined;
//   props?: Record<string, unknown> | undefined;
// }
```

### Naming Conventions

| Zod Schema | TypeScript Type | Description |
|------------|-----------------|-------------|
| `BlockSchemaSchema` | `BlockSchema` | Block configuration |
| `PageSchemaSchema` | `PageSchema` | Page with layout and blocks |
| `ComponentKindSchema` | `ComponentKind` | Valid component kind enum |
| `ResourceConfigSchema` | `ResourceConfigInferred` | Resource configuration |

> [!NOTE]
> The naming convention is `*SchemaSchema` for Zod schemas and `*Schema` for the derived type. This distinguishes between the runtime validator and the static type.

### Enum Schemas

For enumerated types, use `z.enum()`:

```typescript
// Define allowed values as an enum schema
export const ComponentKindSchema = z.enum([
  'table',
  'detail',
  'form',
  'card-list',
  'stat',
]);

// Derive the union type
export type ComponentKind = z.infer<typeof ComponentKindSchema>;
// ComponentKind = 'table' | 'detail' | 'form' | 'card-list' | 'stat'
```

### Schema Composition

Schemas can reference other schemas for nested structures:

```typescript
import { BlockSchemaSchema } from './block.schema';
import { PageGridSchema } from './grid.schema';

export const PageSchemaSchema = z.object({
  id: z.string(),
  layout: z.enum(['admin-shell', 'stack', 'drawer']),
  blocks: z.array(z.unknown()),  // Lenient for graceful degradation
  grid: PageGridSchema.optional(),
});
```

---

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

---

## Validation Layer

The runtime package includes a validation layer that wraps config fetches with Zod `safeParse`. This catches invalid server configs before they reach the UI.

### Error Types

| Type | Description |
|------|-------------|
| `PageConfigError` | Invalid page configuration |
| `ResourceConfigError` | Invalid resource configuration |
| `DataSourceError` | Invalid data source result |
| `BlockConfigError` | Invalid block configuration |
| `ConfigValidationIssue` | Single validation issue with path, message, code |

### Validation Functions

```typescript
import {
  validatePageConfig,
  validateResourceConfig,
  validateDataSourceResult,
  validateBlock,
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

---

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

---

## How to Add a New Block Type

This section walks through adding a new block type (e.g., `chart`) to the schema-driven system.

### Step 1: Extend the `ComponentKind` Enum

Edit `packages/runtime/src/schemas/component-kind.schema.ts`:

```typescript
export const ComponentKindSchema = z.enum([
  'table',
  'detail',
  'form',
  'card-list',
  'stat',
  'chart',  // ← Add new block type
]);
```

> [!IMPORTANT]
> Adding a new enum value is backward-compatible. Existing configs remain valid.

### Step 2: Create the Block Component

Create a new component in `packages/runtime/src/blocks/`:

```typescript
// packages/runtime/src/blocks/ChartBlock.tsx
import type { ReactNode } from 'react';

export type ChartBlockProps = {
  title?: string;
  description?: string;
  data: Array<{ label: string; value: number }>;
  chartType: 'bar' | 'line' | 'pie';
};

export function ChartBlock({ title, description, data, chartType }: ChartBlockProps): ReactNode {
  return (
    <div className="rounded-lg border bg-card p-4">
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {/* Render chart based on chartType and data */}
      <div data-chart-type={chartType}>
        {/* Chart implementation */}
      </div>
    </div>
  );
}
```

### Step 3: Update the Renderer

Edit `packages/runtime/src/resource-page-renderer/resource-page-renderer.tsx`:

```typescript
// Import the new block
import { ChartBlock, type ChartBlockProps } from '../blocks/ChartBlock';

// Add to renderBlockContent function
const renderBlockContent = (
  block: BlockSchema,
  resource: ResourceConfig,
  screen: ResourceScreen,
  dataSources: Record<string, DataSourceResult>,
): ReactNode => {
  const baseProps = block.props ?? {};
  const dataSource = block.dataSourceId
    ? dataSources[block.dataSourceId]
    : undefined;

  // ... existing cases ...

  // Add new block type case
  if (block.kind === 'chart') {
    const props = baseProps as Partial<ChartBlockProps>;
    const chartProps: ChartBlockProps = {
      ...props,
      data: props.data ?? dataSource?.records ?? [],
      chartType: props.chartType ?? 'bar',
    };
    return <ChartBlock {...chartProps} />;
  }

  return null;
};
```

### Step 4: Export the New Block

Edit `packages/runtime/src/blocks/blocks.ts` (or equivalent):

```typescript
export { ChartBlock, type ChartBlockProps } from './ChartBlock';
```

And update the main index:

```typescript
// packages/runtime/src/index.ts
export { ChartBlock, type ChartBlockProps } from './blocks/blocks';
```

### Step 5: Add Fixture for CI Stability

Create `packages/runtime/src/schemas/__tests__/fixtures/valid-chart-block.json`:

```json
{
  "id": "sales-chart",
  "kind": "chart",
  "title": "Sales Overview",
  "dataSourceId": "sales-data",
  "props": {
    "chartType": "bar",
    "data": [
      { "label": "Q1", "value": 100 },
      { "label": "Q2", "value": 150 }
    ]
  }
}
```

### Step 6: Add Test for New Block Type

Update `packages/runtime/src/schemas/__tests__/fixture-validation.test.ts`:

```typescript
import validChartBlock from './fixtures/valid-chart-block.json';

describe('BlockSchemaSchema', () => {
  describe('valid fixtures', () => {
    it('parses valid-chart-block.json successfully', () => {
      const result = BlockSchemaSchema.safeParse(validChartBlock);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.kind).toBe('chart');
        expect(result.data.props?.chartType).toBe('bar');
      }
    });
  });
});
```

### Step 7: Run Tests and Verify

```bash
# Run schema tests
pnpm --filter @lumia/runtime test

# Run lint
pnpm lint

# Verify build
pnpm --filter @lumia/runtime build
```

---

## How to Add a New Field to Existing Schemas

### Adding an Optional Field (Backward-Compatible)

To add an optional field to `BlockSchema`:

```typescript
// packages/runtime/src/schemas/block.schema.ts
export const BlockSchemaSchema = z.object({
  id: z.string(),
  kind: ComponentKindSchema,
  title: z.string().optional(),
  dataSourceId: z.string().optional(),
  props: z.record(z.unknown()).optional(),
  description: z.string().optional(),  // ← New optional field
});
```

> [!TIP]
> Optional fields are always backward-compatible. Existing configs without the field will still validate.

### Adding a Required Field (Breaking Change)

To add a required field:

```typescript
export const BlockSchemaSchema = z.object({
  id: z.string(),
  kind: ComponentKindSchema,
  version: z.number(),  // ← New required field (BREAKING!)
  // ...
});
```

> [!CAUTION]
> Adding a required field is a **breaking change**. All existing configs must be updated to include the new field, and all fixtures must be updated.

### Updating Fixtures After Schema Changes

When you modify a schema, update fixtures to match:

1. **Update valid fixtures** to include the new field (if demonstrating it)
2. **Add invalid fixtures** to test the new field's validation
3. **Run tests** to verify all fixtures still pass

Example for adding `version` field:

```json
// valid-block.json - add optional field
{
  "id": "detail-block-1",
  "kind": "detail",
  "version": 1,
  "title": "User Details"
}
```

```json
// invalid-block-bad-version.json - test type validation
{
  "id": "bad-version-block",
  "kind": "table",
  "version": "not-a-number"
}
```

---

## How Fallbacks Work

The schema-driven UI uses a two-level validation strategy for graceful degradation.

### Page-Level Validation

When `ResourcePageRenderer` loads a page:

```
┌─────────────────────────────────────────────────────────────┐
│                    Page Config Validation                    │
├─────────────────────────────────────────────────────────────┤
│  1. Fetch page config from getPageSchema()                  │
│  2. Validate with PageSchemaSchema.safeParse()              │
│  3. If INVALID → Render PageErrorWidget                     │
│  4. If VALID → Continue to render blocks                    │
└─────────────────────────────────────────────────────────────┘
```

The `PageSchemaSchema` uses **lenient validation** for blocks:

```typescript
export const PageSchemaSchema = z.object({
  id: z.string(),
  layout: z.enum(['admin-shell', 'stack', 'drawer']),
  blocks: z.array(z.unknown()),  // ← Lenient: accepts any block shape
  grid: PageGridSchema.optional(),
});
```

This means:
- Page structure (id, layout) is validated strictly
- Individual blocks are passed through without validation
- Block validation happens at render time

### Block-Level Validation (Graceful Degradation)

Each block is validated independently at render time:

```
┌─────────────────────────────────────────────────────────────┐
│                   Block Render Flow                          │
├─────────────────────────────────────────────────────────────┤
│  For each block in page.blocks:                              │
│    1. validateBlock(blockJson, blockId)                     │
│    2. If INVALID → Render BlockErrorWidget                  │
│    3. If VALID → Render block component                     │
│                                                              │
│  Result: Invalid blocks show error, valid blocks render     │
└─────────────────────────────────────────────────────────────┘
```

### Visual Example

```
┌──────────────────────────────────────────────────────────┐
│  Page: users-list-page (admin-shell layout)              │
├──────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐  │
│  │  Block: users-table (table)        ✓ Valid        │  │
│  │  ┌──────────────────────────────────────────────┐ │  │
│  │  │  Name          │  Email                      │ │  │
│  │  │  John Doe      │  john@example.com           │ │  │
│  │  └──────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Block: stats-block        ✗ Invalid (missing kind)│  │
│  │  ┌──────────────────────────────────────────────┐ │  │
│  │  │  ⚠ Block Error                               │ │  │
│  │  │  Block "stats-block" failed to render        │ │  │
│  │  └──────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Strict Validation (Fail-Fast)

For scenarios where you want to fail fast on any invalid block:

```typescript
import { PageSchemaSchemaStrict } from '@lumia/runtime';

// Validates ALL blocks upfront
const result = PageSchemaSchemaStrict.safeParse(pageJson);
if (!result.success) {
  // Fails immediately if any block is invalid
}
```

### Development Mode Logging

In development mode, validation errors are logged with detailed paths:

```
Page config validation failed for "users-list-page"
  - blocks.1.kind: Required (invalid_type)
```

This helps developers quickly identify and fix schema issues.

---

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

---

## Troubleshooting Common Errors

### Missing Required Fields

**Error:**
```
Page config validation failed for "my-page"
  - id: Required (invalid_type)
```

**Cause:** The `id` field is missing from the page config.

**Solution:** Add the required field to your config:
```json
{
  "id": "my-page",
  "layout": "admin-shell",
  "blocks": []
}
```

### Invalid Enum Values

**Error:**
```
Page config validation failed for "my-page"
  - layout: Invalid enum value. Expected 'admin-shell' | 'stack' | 'drawer', received 'grid' (invalid_enum_value)
```

**Cause:** The `layout` value is not one of the allowed enum values.

**Solution:** Use a valid enum value:
```json
{
  "id": "my-page",
  "layout": "admin-shell",
  "blocks": []
}
```

### Block Kind Not Recognized

**Error:**
```
Block config validation failed for "my-block"
  - kind: Invalid enum value. Expected 'table' | 'detail' | 'form' | 'card-list' | 'stat', received 'custom' (invalid_enum_value)
```

**Cause:** The block `kind` is not registered in `ComponentKind`.

**Solution:** Either:
1. Use an existing block kind
2. Add the new kind to `ComponentKindSchema` (see [How to Add a New Block Type](#how-to-add-a-new-block-type))

### Type Mismatch

**Error:**
```
Grid placement validation failed
  - placements.0.column: Expected number, received string (invalid_type)
```

**Cause:** A field has the wrong type.

**Solution:** Fix the type in your config:
```json
{
  "blockId": "my-block",
  "column": 1,
  "row": 1
}
```

### Debugging Validation Errors

Use `formatValidationError()` for human-readable error messages:

```typescript
import { validatePageConfig, formatValidationError } from '@lumia/runtime';

const result = validatePageConfig(config, 'my-page');
if (!result.success) {
  console.log(formatValidationError(result.error));
  // Page config validation failed for "my-page"
  //   - layout: Required (invalid_type)
  //   - blocks: Expected array, received undefined (invalid_type)
}
```

---

## Data fetching contract

- `getResourceConfig(resourceName)` → `ResourceConfig` (required)
- `getPageSchema(pageId)` → `PageSchema` (required)
- `getDataSource?(dataSourceId, context)` → `DataSourceResult` (`records`, `record`, `initialValues`)
- `canAccess?(context)` → boolean/Promise<boolean> for RBAC gating
- `context`: `{ resource, screen: 'list' | 'detail' | 'create' | 'update', params?, permissions? }`

---

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

---

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
