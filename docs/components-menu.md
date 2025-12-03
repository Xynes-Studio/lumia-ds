# Menu (DS-802)

Dropdown menu wrapper around Radix/`shadcn` primitives with DS spacing, icons, and state styling.

## Exports
- `Menu`, `MenuTrigger`, `MenuContent`, `MenuItem`, `MenuLabel`, `MenuSeparator` from `@lumia/components`.

## Props
- `Menu` uses Radix `DropdownMenuProps`.
- `MenuTrigger` accepts Radix trigger props; `asChild` defaults to `true` so any ReactNode (icon button, link, text) can be the trigger.
- `MenuContent` accepts Radix content props plus `className`.
- `MenuItem: { label: string; icon?: IconId; disabled?: boolean; variant?: 'default' | 'destructive'; onSelect?: () => void }` plus Radix item props. Icons use the design-system registry via `IconId`.
- `MenuLabel` renders a non-interactive section header; accepts Radix label props plus `inset` to indent under an icon column.
- `MenuSeparator` accepts Radix separator props.

## Usage
```tsx
import { Button, Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger } from '@lumia/components';

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
