# DashboardShell (@lumia-ui/layout)

Reusable dashboard scaffold with desktop sidebar + mobile bottom navigation, while keeping routing/auth state in the host app.

## Import

```ts
import {
  DashboardShell,
  DashboardSidebarSection,
  DashboardMainSection,
  type DashboardNavItem,
  type DashboardWorkspace,
  type DashboardUserMenu,
  type DashboardNotification,
  type DashboardShellProps,
} from '@lumia-ui/layout';
```

## Design Goals

- Router-agnostic: `activePath` + optional `onNavigate`.
- Auth-agnostic: workspace/profile/notifications are controlled props.
- Slot-first main area via `children`.
- Mobile-first behavior with bottom tabs and bottom sheets.

## Layout Modes

- Desktop (`>= mobileNavigationBreakpointPx`, default `1024`):
1. Left sidebar.
2. Manual collapse only via `isSidebarCollapsed`.
3. Left-side notifications drawer.
- Mobile (`< mobileNavigationBreakpointPx` when `mobileNavigationEnabled`):
1. Fixed bottom bar with `Notifications` and `Menu` tabs.
2. Notifications bottom sheet.
3. Menu bottom sheet (workspace + nav + profile).

## Core Props

- `activePath`, `navItems`, `onNavigate`.
- `workspace`, `workspaceOptions`, `onWorkspaceSelect`.
- `onCreateWorkspace`, `enableWorkspaceCreation`, `workspaceCreationDisabledMessage`.
- `isSidebarCollapsed` (desktop manual collapse).
- `userMenu`, `onProfileOpen`, `onLogout`.
- `directorySection` (optional nested directory tree for one nav item).

Notification props:
- `notifications`.
- Desktop drawer control: `isNotificationDrawerOpen`, `defaultNotificationDrawerOpen`, `onNotificationDrawerOpenChange`.
- Notification callbacks: `onNotificationsViewed`, `onNotificationClick`, `onNotificationDelete`, `onNotificationNavigate`.
- Navigation safety: `enableNotificationAutoNavigate`.

Mobile navigation props:
- `mobileNavigationEnabled` (default `true`).
- `mobileNavigationBreakpointPx` (default `1024`).
- `mobileMenuOpen`, `defaultMobileMenuOpen`, `onMobileMenuOpenChange`.
- `mobileNotificationsOpen`, `defaultMobileNotificationsOpen`, `onMobileNotificationsOpenChange`.
- `mobileBottomBarInset` (default `0.75rem`).
- `mobileBottomSheetMaxHeight` (default `100dvh`).

## Notification Type

```ts
type DashboardNotification = {
  id: string;
  title: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  fallbackInitials?: string;
  createdAt: string;
  unread?: boolean;
  deepLinkHref?: string;
  deepLinkTarget?: '_self' | '_blank';
  deepLinkRel?: string;
};
```

## Directory Section Type

```ts
type DashboardDirectorySection = {
  navItemId: string;
  rootHref: string;
  activeHref?: string;
  rootLabel?: string;
  rootIcon?: string;
  nodes: DirectoryTreeNode[];
  expandedIds: string[];
  onExpandedIdsChange: (expandedIds: string[]) => void;
  onCreateDirectory: (input: { parentId: string | null; name: string }) => void;
  maxNameLength?: number;
};
```

Behavior notes:
- Additive API: when `directorySection` is undefined, shell nav stays unchanged.
- If `directorySection.navItemId` matches a nav item id, that row renders the reusable `DirectoryTreeNav`.
- Root row keeps route navigation; directory rows support nested expansion and inline creation.
- Directory visuals are rendered as a subtree under the configured root row (for example `Contents`) with increasing indentation per depth.
- Directory rows do not rely on chevrons; click behavior is row-driven (toggle + navigate) for simpler CMS parity.
- Validation enforces trimmed names, max length, and sibling-level case-insensitive uniqueness.

## Callback Lifecycle

Desktop notification drawer:
- Open: `onNotificationDrawerOpenChange(true)`.
- Close: `onNotificationDrawerOpenChange(false)` then `onNotificationsViewed(unreadIds)`.

Mobile notifications sheet:
- Open: `onMobileNotificationsOpenChange(true)`.
- Close: `onMobileNotificationsOpenChange(false)` then `onNotificationsViewed(unreadIds)`.

Notification tile:
- Tile click: `onNotificationClick(notification)`.
- Deep-link present: `onNotificationNavigate(notification)`.
- Delete click: `onNotificationDelete(notification)`.

Mobile mutual exclusivity:
- Opening Menu closes Notifications.
- Opening Notifications closes Menu.

## Controlled vs Uncontrolled

- Desktop drawer: controlled with `isNotificationDrawerOpen`; otherwise uncontrolled with `defaultNotificationDrawerOpen`.
- Mobile menu and mobile notifications follow the same controlled/uncontrolled pattern.

## Security Notes

- Auto-navigation only for safe URLs (`/...`, `http://`, `https://`).
- Unsafe schemes (`javascript:`, `data:`) are blocked.
- `_blank` always enforces `noopener,noreferrer` fallback.
- No auth token handling or network calls in DS shell.

## Accessibility Notes

- Landmarks: `aside`, `nav`, `main`.
- Active items use `aria-current="page"`.
- Bottom tabs expose explicit labels.
- Mobile sheets use dialog semantics from DS `Drawer` primitives (`Drawer`, `DrawerHeader`, `DrawerTitle`).
- Delete actions are keyboard accessible and labeled.

## Legacy Compatibility Note

`enableResponsiveCollapse`, `responsiveCollapseBreakpointPx`, and `onResponsiveCollapseChange` remain accepted for compatibility, but mobile mode takes precedence under the mobile breakpoint and desktop collapse is manual via `isSidebarCollapsed`.

## Detailed Dev Standards

### React / Next.js Integration

- Keep `DashboardShell` as a pure client UI component with prop-driven state.
- In Next.js App Router, wrap it in a client boundary and pass route/user/workspace state from app layer.
- Keep router/auth/network concerns outside DS:
1. Resolve active path in app (`usePathname` or router state).
2. Pass navigation handlers through `onNavigate`.
3. Wire workspace/profile/logout/notification callbacks in app services.

### Segregation and Folder Structure

- `packages/layout/src/dashboard-shell/*` keeps shell composition and shell-specific tests.
- `packages/components/src/drawer/*` keeps reusable drawer primitive behavior.
- `packages/runtime/src/dashboard-shell.stories.tsx` owns runtime story validation only.
- `docs/components-dashboard-shell.md` is the single source for consumer API and lifecycle docs.

### TDD and Coverage Expectations

- Red-Green-Refactor for behavior changes in shell and drawer.
- Keep interaction tests in `dashboard-shell.test.tsx` for callback and responsive behaviors.
- Keep pure utility tests in `dashboard-shell.utils.test.ts` for grouping/link safety helpers.
- Maintain >=80% coverage minimum in touched scope (current layout and components coverage exceeds this threshold).

### Redundancy / Tech-Debt Guardrails

- Reuse shared render helpers for notification list/workspace/profile sections to avoid duplicate behavior branches.
- Keep mobile and desktop callback paths consistent by delegating to common handlers.
- Avoid adding app-specific assumptions (auth SDK imports, route hard-coding, network calls) inside DS.
- Prefer tokenized spacing/colors and existing DS primitives before introducing custom variants.
