# Menu (DS-802)

Dropdown menu wrapper around Radix/`shadcn` primitives with DS spacing, icons, and state styling.

## Exports
- `Menu`, `MenuTrigger`, `MenuContent`, `MenuItem`, `MenuLabel`, `MenuSeparator` from `@lumia-ui/components`.

## Props
- `Menu` uses Radix `DropdownMenuProps`.
- `MenuTrigger` accepts Radix trigger props; `asChild` defaults to `true` so any ReactNode (icon button, link, text) can be the trigger.
- `MenuContent` accepts Radix content props plus `className`.
- `MenuItem: { label: string; icon?: IconId; disabled?: boolean; variant?: 'default' | 'destructive'; onSelect?: () => void }` plus Radix item props. Icons use the design-system registry via `IconId`.
- `MenuLabel` renders a non-interactive section header; accepts Radix label props plus `inset` to indent under an icon column.
- `MenuSeparator` accepts Radix separator props.

## Usage
```tsx
import { Button, Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger } from '@lumia-ui/components';

export function ActionsMenu() {
  return (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="secondary">Actions</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuLabel>Workspace</MenuLabel>
        <MenuItem label="Profile" icon="user" />
        <MenuItem label="Notifications" icon="chat-bubble" />
        <MenuSeparator />
        <MenuLabel>Danger zone</MenuLabel>
        <MenuItem label="Disable account" icon="alert" disabled />
        <MenuItem label="Delete account" icon="delete" variant="destructive" />
      </MenuContent>
    </Menu>
  );
}
```

## Notes
- Keyboard support includes Arrow keys to move items, Enter/Space to select, and Escape to close and return focus to the trigger.
- Disabled items set `aria-disabled`, remove pointer events, and are skipped by Radix focus handling.
- Content spacing, icons, and hover/active/destructive states use DS tokens to align with other popover surfaces.

## Context Menu (DS-803)

Right-click / long-press menus reuse the same spacing, icons, and focus handling as the dropdown `Menu`.

### Exports
- `ContextMenu` from `@lumia-ui/components`.
- `MenuItemConfig` type for `items`.

### Props
- `items: MenuItemConfig[]` — label, icon, disabled, variant (`'default' | 'destructive'`), optional `id` and `onSelect`.
- `children: ReactNode` — area that reacts to context click / long-press. Provide a focusable child (e.g., button, link, or `tabIndex={0}`) for keyboard opening (`Shift+F10` / Context Menu key).
- `contentProps` mirrors Radix `ContextMenuContentProps` for positioning tweaks; remaining props are Radix `ContextMenuProps`.

### Usage
```tsx
import { ContextMenu, type MenuItemConfig } from '@lumia-ui/components';

const items: MenuItemConfig[] = [
  { id: 'edit', label: 'Edit', icon: 'user' },
  { id: 'duplicate', label: 'Duplicate', icon: 'settings' },
  { id: 'delete', label: 'Delete', icon: 'delete', variant: 'destructive' },
];

export function RowContextMenu({ children }: { children: React.ReactNode }) {
  return (
    <ContextMenu items={items}>
      <div tabIndex={0} className="cursor-context-menu rounded-md border p-4">
        {children}
      </div>
    </ContextMenu>
  );
}
```

### Notes
- Opens at the cursor on right-click or long-press (mobile where supported).
- Keyboard: focus the trigger area then press `Shift+F10` / Context Menu key; arrow keys and Enter/Space operate items like the dropdown `Menu`.
- Disabled items set `aria-disabled` and skip selection; closing returns focus to the trigger.
