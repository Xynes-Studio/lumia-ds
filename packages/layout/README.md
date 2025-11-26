# @lumia/layout

Layout primitives for admin-style shells. Components will iterate in follow-up tickets.

## Install

```bash
pnpm add @lumia/layout @lumia/components
```

## Components

- `AdminShell` – ready-to-use admin layout with responsive sidebar
- `LayoutShell` – top-level vertical shell container
- `LayoutHeader` – sticky-style header area
- `LayoutBody` – flex wrapper for sidebar + main
- `LayoutSidebar` – collapsible sidebar, hidden below `md`
- `LayoutMain` – main content area
- `LayoutContent` – width-constrained content stack with optional padding
- `LayoutFooter` – footer strip for metadata or actions
- `StackLayout` – detail-style layout with top actions and stacked content
- `DrawerLayout` – controlled overlay drawer container for secondary flows

All layout primitives compose the shared `Flex` component, so prefer tweaking via props (`direction`, `align`, `justify`, etc.) instead of raw `flex-*` strings.

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

### Stacked detail pages

```tsx
import { StackLayout } from '@lumia/layout';
import { Button } from '@lumia/components';

export function AccountDetails() {
    return (
        <StackLayout title="Account details" actions={<Button size="sm">Save changes</Button>}>
            <section className="rounded-lg border border-border bg-background/80 p-5 shadow-sm">
                <h2 className="text-base font-semibold leading-6">Profile</h2>
                <p className="text-sm text-muted">Name, email, and contact information.</p>
            </section>
            <section className="rounded-lg border border-border bg-background/80 p-5 shadow-sm">
                <h2 className="text-base font-semibold leading-6">Security</h2>
                <p className="text-sm text-muted">Passwords, MFA, and devices.</p>
            </section>
        </StackLayout>
    );
}
```

### Drawer-based experiences

```tsx
import { useState } from 'react';
import { DrawerLayout } from '@lumia/layout';
import { Button } from '@lumia/components';

export function DrawerExample() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)}>Open drawer</Button>
            <DrawerLayout isOpen={open} onClose={() => setOpen(false)}>
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold leading-6">Filters</h2>
                    <p className="text-sm text-muted">Place your filter controls or secondary flows here.</p>
                </div>
            </DrawerLayout>
        </>
    );
}
```
