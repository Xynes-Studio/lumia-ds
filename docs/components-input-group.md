# InputGroup (DS-1012)

Compose inputs with leading/trailing adornments like icons, text, or buttons.

## Exports
- `InputGroup`, `InputGroupInput`, `InputGroupPrefix`, `InputGroupSuffix` from `@lumia/components`.

## Structure
- `InputGroup`: flex container that handles border, radius, and focus ring.
- `InputGroupPrefix` / `InputGroupSuffix`: addon slots for icons, text, or actions.
- `InputGroupInput`: bare input element that inherits `disabled`/`invalid` from the group.

## Behavior
- Single border/radius via `overflow-hidden` container; inner input removes its own border to avoid doubles.
- `invalid` and `disabled` on `InputGroup` cascade to children and set `aria-disabled`/`aria-invalid`.
- Works with icons, static text (e.g., currency), and buttons; addons are nowrap by default.

## Usage
```tsx
import {
  Button,
  InputGroup,
  InputGroupInput,
  InputGroupPrefix,
  InputGroupSuffix,
} from '@lumia/components';
import { Icon } from '@lumia/icons';

export function SearchField() {
  return (
    <div className="space-y-3">
      <InputGroup>
        <InputGroupPrefix>
          <Icon id="search" size={16} className="text-muted" />
        </InputGroupPrefix>
        <InputGroupInput placeholder="Search the docs" />
        <InputGroupSuffix className="text-muted">⌘K</InputGroupSuffix>
      </InputGroup>

      <InputGroup>
        <InputGroupPrefix>$</InputGroupPrefix>
        <InputGroupInput aria-label="Amount" defaultValue="1200" />
        <InputGroupSuffix className="text-muted">USD</InputGroupSuffix>
      </InputGroup>

      <InputGroup>
        <InputGroupInput placeholder="Search products" />
        <InputGroupSuffix className="bg-transparent px-0 py-0">
          <Button
            size="sm"
            className="h-full rounded-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            Search
          </Button>
        </InputGroupSuffix>
      </InputGroup>
    </div>
  );
}
```

## Notes
- Use `className` on prefix/suffix to swap backgrounds or padding when embedding buttons.
- Inputs inside the group remain fully controllable—pass any native input props (type, value, onChange, etc.).
- Follows shadcn-derived tokens for spacing, focus ring, and typography to match other fields.
