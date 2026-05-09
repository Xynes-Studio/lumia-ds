# @lumia-ui/layout

Layout primitives for admin-style shells. Components will iterate in follow-up tickets.

## Install

```bash
pnpm add @lumia-ui/layout @lumia-ui/components
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
} from '@lumia-ui/layout';

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
import { AdminShell } from '@lumia-ui/layout';

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

### Dashboard shell labels and product copy

`DashboardShell` is shared by Xynes apps, but Lumia DS does not own product
copy or translations. Consumers should pass app-local, translated copy through
the `labels` prop for workspace switching, profile actions, notification
surfaces, mobile navigation, and landmark/accessibility labels.

```tsx
import { DashboardShell } from '@lumia-ui/layout';

<DashboardShell
    activePath="/dashboard/apps"
    navItems={navItems}
    workspace={workspace}
    workspaceOptions={workspaceOptions}
    onWorkspaceSelect={selectWorkspace}
    userMenu={userMenu}
    onLogout={logout}
    labels={{
        workspace: {
            trigger: t('shell.workspace.trigger'),
            currentSection: t('shell.workspace.currentSection'),
            createAction: t('shell.workspace.createAction'),
        },
        profile: {
            trigger: t('shell.profile.trigger'),
            profileAction: t('shell.profile.profileAction'),
            logoutAction: t('shell.profile.logoutAction'),
        },
        notifications: {
            open: t('shell.notifications.open'),
            tab: t('shell.notifications.tab'),
            title: (count) => t('shell.notifications.title', { count }),
            todayGroup: t('shell.notifications.groups.today'),
            yesterdayGroup: t('shell.notifications.groups.yesterday'),
            dateGroup: (date) => dateFormatter.format(date),
            delete: (notification) =>
                t('shell.notifications.delete', { title: notification.title }),
        },
    }}
>
    {children}
</DashboardShell>;
```

Backwards-compatible English defaults are provided so existing consumers do not
break, but new or migrated apps should supply labels from their own catalogs.
Do not pass raw HTML strings. Rich product copy should be composed by the app
before it reaches Lumia components.

### Stacked detail pages

```tsx
import { StackLayout } from '@lumia-ui/layout';
import { Button } from '@lumia-ui/components';

export function AccountDetails() {
    return (
        <StackLayout title="Account details" actions={<Button size="sm">Save changes</Button>}>
            <section className="rounded-lg border border-border bg-background/80 p-5 shadow-sm">
                <h2 className="text-base font-semibold leading-6">Profile</h2>
                <p className="text-sm text-muted-foreground ">Name, email, and contact information.</p>
            </section>
            <section className="rounded-lg border border-border bg-background/80 p-5 shadow-sm">
                <h2 className="text-base font-semibold leading-6">Security</h2>
                <p className="text-sm text-muted-foreground ">Passwords, MFA, and devices.</p>
            </section>
        </StackLayout>
    );
}
```

### Drawer-based experiences

```tsx
import { useState } from 'react';
import { DrawerLayout } from '@lumia-ui/layout';
import { Button } from '@lumia-ui/components';

export function DrawerExample() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)}>Open drawer</Button>
            <DrawerLayout isOpen={open} onClose={() => setOpen(false)}>
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold leading-6">Filters</h2>
                    <p className="text-sm text-muted-foreground ">Place your filter controls or secondary flows here.</p>
                </div>
            </DrawerLayout>
        </>
    );
}
```
