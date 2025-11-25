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
- `id`: resource key.
- `pages?`: set of `PageSchema` IDs for `list`, `detail`, `create`, and `edit` views, keeping resource configuration linked back to defined pages.
