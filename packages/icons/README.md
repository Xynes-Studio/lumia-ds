# @lumia-ui/icons

Icon registry utilities and the unified `<Icon>` React component for Lumia DS.

## Install

```bash
pnpm add @lumia-ui/icons
```

## Unified Icon Component

The `<Icon>` component provides a single API for all icons:

```tsx
import { Icon, IconSprite } from '@lumia-ui/icons';

// Add sprite once at app root
function App() {
  return (
    <>
      <IconSprite />
      <YourRoutes />
    </>
  );
}

// Use anywhere
<Icon name="info" />
<Icon name="check" size="lg" color="primary" />
<Icon name="alert" color="danger" title="Warning" />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | — | Icon name from registry |
| `size` | `'sm' \| 'md' \| 'lg' \| number` | `'md'` | Size preset or pixels |
| `color` | `'default' \| 'muted' \| 'primary' \| 'danger' \| string` | `'default'` | Color preset or CSS |
| `title` | `string` | — | Accessible title |

### Size Presets

- `sm` = 16px
- `md` = 24px (default)
- `lg` = 32px

### Color Presets

- `default` → text-foreground
- `muted` → text-muted-foreground
- `primary` → text-primary
- `danger` → text-destructive

### Accessibility

Icons support both decorative and informative semantics:

**Decorative icons** (default) are hidden from screen readers:
```tsx
<Icon name="check" />
// Output: <svg aria-hidden="true" focusable="false" />
```

**Informative icons** convey meaning via the `title` prop:
```tsx
<Icon name="alert" title="Warning: Action required" />
// Output: <svg role="img" aria-labelledby="icon-title-alert"><title>...</title>
```

Same pattern works for `SpriteIcon`:
```tsx
<SpriteIcon name="info" title="More information" />
```

## Available Icons

**Curated Lucide icons:** `home`, `user`, `users`, `users-round`, `settings`, `reports`, `add`, `edit`, `delete`, `filter`, `search`, `check`, `alert`, `info`, `layout-grid`, `list`, `package`, `folder-key`, `folder`, `lock`, `file-text`, `dollar-sign`, `chevron-up`, `chevron-down`, `star`, `republish`, `archive-entry`, `bold`, `italic`, `underline`, `code`, `link`, `trash`, `external-link`, `file-code`, `list-ordered`

**Custom icons:** `sparkle`, `chat-bubble`

**Sprite icons (hot-path):** `chevron-down`, `chevron-up`, `check`, `add`, `edit`, `delete`, `info`, `alert`, `search`

## Icon Purpose Registry

This table is the canonical contract for what each icon means across Xynes
products. Consumers (Auth Admin, CMS Console, future apps) MUST resolve a
purpose to an icon ID through this table instead of registering app-local
icons for shared concepts. App-local icons are only allowed for
product-specific concepts that are not in the table — and even then the
preferred path is to add a row here first.

> Lumia DS components stay product-copy-neutral: this table maps **icon ID →
> purpose**, not icon ID → English label. Consumers always supply the
> translated, action-oriented accessible name from their own message catalog.

| Icon ID | Purpose | Allowed contexts | Accessible-label guidance |
|---|---|---|---|
| `home` | Navigation: workspace home / dashboard root. | Sidebar, breadcrumbs. | Decorative when adjacent to a translated nav label; otherwise label the wrapping link as the destination. |
| `users-round` | Navigation: people / directory / members. | Sidebar, link buttons. | Label the wrapping link with the destination noun (e.g. directory). |
| `folder-key` | Navigation: access control / RBAC. | Sidebar. | Decorative — wrapping nav link carries the label. |
| `lock` | Status / navigation: security, gated, restricted. | Sidebar, badges, alerts. | Decorative when paired with text; informative title when standalone. |
| `link` | Command / status: relate, attach, copy link. | Toolbar buttons, inline actions. | Action-oriented label on the wrapping button (e.g. "Insert link"). |
| `file-text` | Navigation / object: documents, articles, entries. | Sidebar, lists, toolbars. | Decorative next to a translated label. |
| `dollar-sign` | Navigation: billing, plans, usage. | Sidebar. | Decorative — wrapping nav link carries the label. |
| `settings` | Navigation: settings, configuration. | Sidebar, dropdown items. | Decorative — wrapping nav link carries the label. |
| `package` | Navigation: apps, modules, plugins. | Sidebar. | Decorative — wrapping nav link carries the label. |
| `layout-grid` | View mode: grid view. | View toggle controls. | Action-oriented label on the wrapping button (e.g. "Grid view"). |
| `list` | View mode: list view. | View toggle controls. | Action-oriented label on the wrapping button (e.g. "List view"). |
| `filter` | Command: filter / refine. | Toolbar buttons. | "Filter results" or product-specific equivalent. |
| `search` | Command: search / lookup. | Inputs, toolbar buttons. | Tied to the input's accessible name; standalone trigger uses "Search". |
| `add` | Command: create / add new. | Primary buttons, toolbars, empty states. | Action-oriented label naming the object (e.g. "Create entry"). |
| `edit` | Command: edit existing. | Row actions, detail toolbars. | Action-oriented label naming the object (e.g. "Edit entry"). |
| `delete` | Command: destructive delete / trash. | Row actions, detail menus. | Action-oriented label naming the object (e.g. "Delete entry"). |
| `republish` | Command: republish a published entry whose draft is ahead. | CMS editor publish menu. | "Republish now" or product-specific equivalent. Prefer the registry id over registering an app-local icon. |
| `archive-entry` | Command: move an entry to the archived state. | CMS editor publish menu. | "Archive entry" or product-specific equivalent. |
| `chevron-down` | Disclosure: expand / open menu. | Menu triggers, accordions. | Decorative — the wrapping disclosure button owns the accessible name and `aria-expanded`. |
| `chevron-up` | Disclosure: collapse / close menu. | Menu triggers, accordions. | Decorative — the wrapping disclosure button owns the accessible name. |
| `external-link` | Status: target opens in a new tab / leaves the app. | Anchors with `target="_blank"`. | The link itself carries the destination label; pair the icon with a sr-only "(opens in new tab)" hint when the link text alone does not say so. |
| `check` | Status: success / done / verified. | Badges, alerts, list rows. | Use `title` on `<Icon>` when the icon is the only signal of success; otherwise decorative. |
| `alert` | Status: warning / error / requires attention. | Alerts, banners, inline validation. | Use `title` (e.g. "Warning") when the icon is the only signal of severity; otherwise decorative. |
| `info` | Status: informational / help. | Tooltips, banners, callouts. | Use `title` ("More information") for icon-only triggers. |
| `star` | Status / command: favorite, pinned, important. | Toolbar toggles, list row badges. | Action-oriented label reflecting the toggle state ("Add to favorites" / "Remove from favorites"). |

### Adding a canonical icon

1. Pick a purpose-driven ID (kebab-case noun-or-verb, e.g. `archive-entry`,
   not `archive` — IDs should describe the *purpose* the icon serves in
   product UI, not the shape of the SVG).
2. Map it to a Lucide-backed component in
   `packages/icons/src/default-icons.ts`, or generate one from
   `packages/icons/svg/` via `pnpm build:icons`.
3. Add the row to the table above.
4. Add the ID to the canonical-ids assertion in
   `packages/icons/src/index.test.tsx`.

### Accessibility rules

These rules apply to every consumer of `@lumia-ui/icons`:

- **Decorative icons** (the icon is paired with a translated visible label
  or with a wrapping button/link that already carries the label) MUST be
  rendered with `aria-hidden`. The default `<Icon name="…" />` already does
  this — do not pass `title` for decorative icons.
- **Informative icons** (the icon is the only signal of state, e.g. a
  status badge, an icon-only command button, or a standalone severity mark)
  MUST be given an action-oriented accessible name. Use `<Icon title="…">`
  for an inline title element, or label the wrapping button/link with
  `aria-label` / visually-hidden text.
- **Action-oriented labels** name what the user will do or what changes,
  not the icon shape. Prefer "Republish now" over "Refresh icon", and
  "Open notifications" over "Bell".
- **Icon-only buttons** must meet WCAG 2.2 target-size minimum (24×24 CSS
  pixels with sufficient spacing, or 44×44 for primary touch targets) and
  must carry the accessible name on the wrapping `<button>` / `<a>`, not
  on the icon.
- **Decorative duplicates** (icon next to a label that says the same
  thing) are fine — keep the icon `aria-hidden` so assistive tech does not
  read the label twice.

### App-local icons

If a concept is genuinely product-specific (e.g. a one-off marketing
illustration, an editor toolbar glyph that no other product uses), a
consumer MAY register it locally with `registerIcon(...)` from
`@lumia-ui/icons`. Prefer adding a canonical ID to the table above for
anything that more than one product is likely to need.

## Registering Custom Icons

```tsx
import { registerIcon } from '@lumia-ui/icons';

const CustomBell = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M12 2a7 7 0 00-7 7v3l-1.5 2H20.5L19 12V9a7 7 0 00-7-7Z" />
  </svg>
);

registerIcon('bell', CustomBell);
// Now use: <Icon name="bell" />
```

## Building Icons from SVG

Add SVG files to `packages/icons/svg/` and run:

```bash
pnpm build:icons
```

Generated components are exported from `@lumia-ui/icons` and auto-registered.

## Direct Import (Tree-Shakable)

```tsx
import { IconCheck, IconSparkle } from '@lumia-ui/icons';

<IconCheck className="text-green-500" />
```
