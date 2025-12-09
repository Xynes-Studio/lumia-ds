# NumberInput (DS-1004)

Numeric field with increment/decrement controls.

## Exports
- `NumberInput` from `@lumia-ui/components`.

## Props
- `value: number | undefined` – controlled value.
- `onChange(value: number | undefined)` – fired on manual entry or control clicks; receives `undefined` when cleared.
- `min?: number`, `max?: number` – optional bounds; values clamp to these limits.
- `step?: number` – increment size for arrows, controls, and keyboard (default `1`).
- Supports standard input props like `disabled`, `aria-*`, `placeholder`, and `className`.

## Behavior
- Up/down buttons use chevron icons and respect `step`, `min`, and `max`.
- Typing clamps on blur; clearing the field emits `undefined`.
- ArrowUp/ArrowDown keys step the value while focused.
- Invalid state mirrors other fields, reusing shadcn-style focus rings and tokens.

## Usage
```tsx
import { NumberInput } from '@lumia-ui/components';

export function QuantityField() {
  const [value, setValue] = useState<number | undefined>(3);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Quantity</label>
      <NumberInput
        value={value}
        onChange={setValue}
        min={1}
        max={10}
        step={1}
        aria-label="Quantity"
        hint="Use arrows or type a number."
      />
    </div>
  );
}
```

## Notes
- Uses the same typography and focus ring tokens as other shadcn-based fields.
- `inputMode="decimal"` to encourage numeric keyboards on mobile.
- When `disabled`, both the field and controls dim and ignore clicks/keys.
