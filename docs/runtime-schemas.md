# Runtime Schemas

Types and renderer entry points from `@lumia/runtime` for describing resource-driven pages.

## Core types

- `ComponentKind`: `table | detail | form | card-list | stat`
- `BlockSchema`: `{ id, kind, title?, dataSourceId?, props? }`
- `PageSchema`: `{ id, layout: 'admin-shell' | 'stack' | 'drawer', blocks, grid? }`
- `ResourceConfig<TValues>`: `{ id, pages?, fields?, dataFetcher? }`
- `ResourcePageRefs`: `{ list?, detail?, create?, edit?, update? }`

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
