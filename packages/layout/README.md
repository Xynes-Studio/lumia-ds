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

### Dashboard shell layout contract (BUG-LDS-1)

`DashboardShell` owns its own viewport-locked layout so consumers do not have to fight document-level scroll. The contract — encoded inside the shell — is:

1. **Outer wrapper** carries `h-dvh w-full overflow-hidden` (with a `supports-[height:100svh]:h-svh` fallback for older browsers). This disables document-level scroll on dashboard routes. The element is exposed via `data-testid="dashboard-root"` for layout-invariant tests.
2. **Sidebar (left rail)** is a fixed-height column with three slots:
   - **Top** — workspace switcher (anchored, no scroll).
   - **Middle** — the only scrollable slot in the rail: `min-h-0 flex-1 overflow-y-auto` (exposed via `data-testid="dashboard-sidebar-scroll-region"`).
   - **Bottom** — profile menu + footer (anchored, no scroll).
   The sidebar `Card` itself carries `h-full overflow-hidden` (exposed via `data-testid="dashboard-sidebar-frame"`).
3. **Main content panel** (right) is height-locked and **owns its own scroll**: the `Card` carries `flex h-full min-h-0 overflow-hidden` (`data-testid="dashboard-main-frame"`) to clip at the panel edge, and the inner `CardContent` (`data-testid="dashboard-main-scroll-frame"`) carries `min-h-0 flex-1 overflow-y-auto` so tall page content scrolls **inside the right panel** while the rail stays anchored. Consumers drop their content straight in — no consumer-side scroll container is required.

**Consumers must not** add `h-screen`, `min-h-screen`, `overflow-hidden`, sticky positioning, or their own `overflow-y-auto` scroll container around the children passed into `DashboardShell`. The shell already locks the viewport and provides the right-pane scroll; an extra consumer-side scroll container produces double scrollbars and fights the rail's anchored layout (see `AGENTS.md` §7 rule 9).

If a consumer page needs a *nested* scroll region with pinned chrome (e.g. a sticky filter bar above an independently scrolling list), compose it inside the children using `min-h-0` flex layout — but the default and expected case is to let the shell's right pane scroll.

The contract is enforced by:
- Vitest assertions in `dashboard-shell.test.tsx` under the `DashboardShell shell layout contract (BUG-LDS-1)` describe block (classname invariants — including the right pane's `overflow-y-auto`).
- A Playwright runtime spec `e2e/dashboard-shell-scroll.spec.ts` against the `Runtime/DashboardShell` Storybook story, which proves at real layout that the document does not scroll, the right pane *does* scroll when content overflows, and the anchored profile/footer stay pinned across 720/900/1200 px heights. Evidence PNGs land in `docs/visual-evidence/2026-Q2-bugfix-sprint/BUG-LDS-1/`.

Any drive-by edit that drops `h-dvh`, the rail's `overflow-hidden`, the anchored 3-slot rail, or the right pane's `overflow-y-auto` will fail these checks.

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

### Workspace switcher contract

`DashboardWorkspaceSwitcher` is the reusable workspace switcher used by
`DashboardShell`. Apps should use the shell-level workspace props when they are
inside `DashboardShell`; app-local switchers should only exist for routes that
cannot use the dashboard shell.

```tsx
import { DashboardWorkspaceSwitcher } from '@lumia-ui/layout';

<DashboardWorkspaceSwitcher
    workspace={{
        id: 'workspace-1',
        name: 'Acme Workspace',
        slug: 'acme',
    }}
    workspaceOptions={[
        { id: 'workspace-1', name: 'Acme Workspace', slug: 'acme' },
        { id: 'workspace-2', name: 'Lumia Studio', slug: 'lumia' },
    ]}
    onWorkspaceSelect={(workspaceId) => selectWorkspace(workspaceId)}
    onCreateWorkspace={() => openWorkspaceCreation()}
    labels={{
        trigger: t('shell.workspace.trigger'),
        currentSection: t('shell.workspace.currentSection'),
        currentBadge: t('shell.workspace.currentBadge'),
        switchToSection: t('shell.workspace.switchToSection'),
        createAction: t('shell.workspace.createAction'),
    }}
/>;
```

The switcher contract accepts the current workspace, all switchable workspace
options, optional avatar metadata, the workspace-select callback, create-workspace
state, disabled create-workspace explanatory copy, compact rendering, and
consumer-supplied labels. The trigger uses a real button, the menu returns focus
to the trigger on close through the shared `Menu` primitive, the current
workspace is marked with `aria-current`, and compact mode keeps an accessible
trigger label even when the visible workspace name is hidden.

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
