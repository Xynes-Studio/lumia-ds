# Popover (DS-907)

Radix-based popover primitive for anchored overlays such as menus, forms, and pickers with DS token styling.

## Exports
- `Popover`, `PopoverTrigger`, `PopoverContent` from `@lumia-ui/components`.

## Props & behavior
- `Popover` mirrors Radix `Root`, supports controlled (`open`) and uncontrolled (`defaultOpen`) modes, and restores focus to the trigger when closing.
- `PopoverTrigger` defaults `asChild` so any element can act as the trigger; sets `aria-haspopup="dialog"` by default, manages `aria-expanded`, and forwards refs.
- `PopoverContent` mirrors Radix content props; defaults `sideOffset=8`, uses card-like DS tokens (border, background, shadow, radius), and includes focus-visible ring styling.

## Usage
```tsx
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@lumia-ui/components';

export function Example() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <div className="space-y-3">
          <p className="text-sm font-semibold leading-5 text-foreground">
            Quick form
          </p>
          <p className="text-sm leading-5 text-muted-foreground ">
            Use popovers for lightweight, anchored overlays.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
            <Button size="sm">Apply</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

## Accessibility notes
- Trigger exposes `aria-haspopup="dialog"` and `aria-expanded` when possible; focus returns to the trigger on close.
- Content is portal-mounted, keyboard focusable, and supports Radix positioning props (`side`, `align`, offsets).
