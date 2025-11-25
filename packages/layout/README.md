# @lumia/layout

Layout primitives for admin-style shells. Components are placeholders and will be iterated in follow-up tickets.

## Components

- `AdminShell` – ready-to-use admin layout with responsive sidebar
- `LayoutShell` – top-level vertical shell container
- `LayoutHeader` – sticky-style header area
- `LayoutBody` – flex wrapper for sidebar + main
- `LayoutSidebar` – collapsible sidebar, hidden below `md`
- `LayoutMain` – main content area
- `LayoutContent` – width-constrained content stack with optional padding
- `LayoutFooter` – footer strip for metadata or actions

## Usage

```tsx
import {
    LayoutShell,
    LayoutHeader,
    LayoutBody,
    LayoutSidebar,
    LayoutMain,
    LayoutContent,
    LayoutFooter,
} from '@lumia/layout';

export function AdminLayout() {
    return (
        <LayoutShell>
            <LayoutHeader>Header</LayoutHeader>
            <LayoutBody>
                <LayoutSidebar>Nav</LayoutSidebar>
                <LayoutMain>
                    <LayoutContent>Page content</LayoutContent>
                </LayoutMain>
            </LayoutBody>
            <LayoutFooter>Footer</LayoutFooter>
        </LayoutShell>
    );
}
```

`AdminShell` composes the primitives for you when you just need a header + sidebar + content scaffold:

```tsx
import { AdminShell } from '@lumia/layout';

export function AdminLayout() {
    return (
        <AdminShell
            header={<div>Header</div>}
            sidebar={<div>Sidebar nav</div>}
        >
            <p>Your routed content</p>
        </AdminShell>
    );
}
```

All components accept standard `div` props (`className`, `style`, etc.) for easy styling overrides.
