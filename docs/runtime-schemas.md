# Runtime Schemas

The runtime package (`@lumia/runtime`) contains the types used by a renderer to describe screens and resources.

## ComponentKind
- Union of component primitives the renderer knows about: `table | detail | form | card-list | stat`.

## BlockSchema
- `id`: unique identifier for the block on a page.
- `kind`: one of the `ComponentKind` values.
- `title?`: optional display label.
- `dataSourceId?`: optional identifier for the backing data source.
- `props?`: arbitrary props bag forwarded to the component.

## PageSchema
- `id`: unique page identifier.
- `layout`: `admin-shell | stack | drawer`.
- `blocks`: array of `BlockSchema` entries.
- `grid?`: lightweight placement helper with `placements` mapping `blockId` to `row/column` plus optional `columnSpan`/`rowSpan`, and optional `columns`/`gap` hints.

## ResourceConfig
- Generic over the resource shape (`ResourceConfig<TValues>`).
- `id`: resource key.
- `pages?`: set of `PageSchema` IDs for `list`, `detail`, `create`, and `edit/update` views, keeping resource configuration linked back to defined pages.
- `fields?`: array of `FieldConfig` entries describing form inputs (`name`, `label`, `kind` of `text | textarea | select | checkbox`, optional `placeholder`/`hint`/`options`/`defaultValue`/`validation` rules).
- `dataFetcher?`: optional `create`/`update` callbacks the `FormBlock` can call when no explicit `onSubmit` handler is provided.

## DataFetcher
- Contract the runtime renderer uses to resolve config and data:
  - `getResourceConfig(resourceName)` → `ResourceConfig` (required).
  - `getPageSchema(pageId)` → `PageSchema` (required).
  - `getDataSource?(dataSourceId, context)` → `DataSourceResult` (`records`, `record`, `initialValues`) for blocks that declare a `dataSourceId`.
  - `canAccess?(context)` → boolean for RBAC gating; returns `false` to block rendering.
- `context` includes `{ resource, screen, params?, permissions? }` where `screen` is `list | detail | create | update`.

## ResourcePageRenderer
- Exported entry point that stitches together resource/page schemas and renders blocks:
  - Props: `resourceName`, `screen`, optional `params`, `permissions`, and a `fetcher: DataFetcher`.
  - Resolves the `ResourceConfig`, picks the correct `PageSchema` for the `screen`, gathers data sources, checks `canAccess`, and then renders blocks using the configured layout (`AdminShell | StackLayout | DrawerLayout`).
  - Block rendering is automatic: `table` → `ListBlock`, `detail` → `DetailBlock`, `form` → `FormBlock` (mode defaults to `create` unless `screen === 'update'`).
- Simple usage:
```tsx
import { ResourcePageRenderer } from '@lumia/runtime';

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

## Block Components
- `ListBlock`: DS Card-wrapped data table for array data. Props include `data: any[]`, `columns` (key/label/field/align/render), optional `title`/`description`, and `emptyMessage`. Columns can look up nested values via `field` (dot notation) and can override rendering per cell. When `virtualized: true` is passed via `BlockSchema.props`, large datasets automatically render with the `FlatList` component (virtualized window) while smaller datasets still use the simple table markup.
- `DetailBlock`: DS Card-wrapped detail view for a single `record`. Props include `fields` (key/label/field/hint/span/render), optional `columns` layout count, `title`/`description`, and `emptyMessage`. Fields can span up to 3 columns and render custom content.
- `FormBlock`: DS Card-wrapped form builder that renders `ResourceConfig.fields` into DS inputs (`ValidatedInput`, `Select`, `Checkbox`, `Textarea`) via `react-hook-form`. Props include `resource`, `mode: 'create' | 'update'`, optional `initialValues`, `submitLabel`, `emptyMessage`, `onSubmit`, and `dataFetcher` (falls back to `resource.dataFetcher`). Field-level `validation` rules are wired into RHF validation.
- Both components render in isolation (no data sources required) and are exported from `@lumia/runtime` for schema-driven usage (e.g., pass `BlockSchema.props` through to the components).

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
