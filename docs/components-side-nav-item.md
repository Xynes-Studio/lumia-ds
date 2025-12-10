# SideNavItem (DS-805)

Single clickable row for vertical side navigation with icon support, active styling, and optional badge counts.

## Exports
- `SideNavItem` from `@lumia-ui/components`.

## Props
- `label: string` — visible text.
- `icon?: IconId` — optional leading icon from the shared registry.
- `active?: boolean` — highlights the item, adjusts badge color, and sets `aria-current="page"`.
- `badgeCount?: number` — shows a pill when the value is greater than zero.
- `href?: string` — renders an anchor; omit to render a button. All other anchor or button props (e.g., `onClick`, `target`, `rel`, `type`) are passed through.

## Usage
```tsx
import { SideNavItem } from '@lumia-ui/components';

export function AppSidebar() {
  return (
    <nav className="w-64 space-y-1 rounded-lg border border-border bg-background p-2">
      <SideNavItem label="Dashboard" href="#dashboard" icon="home" active />
      <SideNavItem label="Reports" href="#reports" icon="reports" badgeCount={12} />
      <SideNavItem label="Settings" href="#settings" icon="settings" />
      <SideNavItem label="Teams" onClick={() => console.log('teams')} icon="users" />
    </nav>
  );
}
```

## Notes
- Badge pills are hidden for zero or undefined counts to avoid empty indicators.
- Uses shadcn-style spacing, focus ring, and hover states so items can sit in any stacked sidebar container.
- For SPA routing, supply `href` with the correct link component wrapper or handle navigation via `onClick`.
