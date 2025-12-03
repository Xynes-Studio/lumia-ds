# Menu (DS-801)

Dropdown menu wrapper around Radix/`shadcn` primitives with DS spacing and typography.

## Exports
- `Menu`, `MenuTrigger`, `MenuContent`, `MenuItem`, `MenuSeparator` from `@lumia/components`.

## Props
- `Menu` uses Radix `DropdownMenuProps`.
- `MenuTrigger` accepts Radix trigger props; `asChild` defaults to `true` so any ReactNode (icon button, link, text) can be the trigger.
- `MenuContent` accepts Radix content props plus `className`.
- `MenuItem: { label: string; icon?: ReactNode; onSelect?: () => void }` plus Radix item props.
- `MenuSeparator` accepts Radix separator props.

## Usage
```tsx
import { Icon } from '@lumia/icons';
import { Button, Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '@lumia/components';

export function ActionsMenu() {
  return (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="secondary">Actions</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem label="Profile" icon={<Icon id="user" size={16} />} />
        <MenuItem label="Notifications" icon={<Icon id="chat-bubble" size={16} />} />
        <MenuSeparator />
        <MenuItem label="Sign out" onSelect={() => console.log('Signing out')} />
      </MenuContent>
    </Menu>
  );
}
```

## Notes
- Keyboard support includes Arrow keys to move items, Enter/Space to select, and Escape to close and return focus to the trigger.
- Items highlight on focus/hover and respect disabled state via Radix.
- Content spacing, fonts, borders, and focus states use DS tokens to match buttons and popovers.
