# DateRangeFilter (@lumia/components)

Reusable date range input intended for FilterBar-style controls. Ships with optional quick presets and keyboard-friendly behavior out of the box.

## Import
```ts
import {
  DateRangeFilter,
  type DateRangeFilterProps,
  type DateRangeValue,
  type DateRangePreset,
} from '@lumia/components';
```

## Props
- `value?: { from?: Date; to?: Date }` — controlled value; partial ranges are allowed.
- `onChange(value)` — called when either date input or a preset changes the range.
- `presets?: { label: string; getValue: () => { from?: Date; to?: Date } }[]` — optional quick picks; defaults to Today, Last 7 days, This month.
- `placeholder?: string` — text when no range is selected (default: “Select date range”).
- `label?: string` — optional form label rendered above the trigger.
- `hint?: string` and `invalid?: boolean` — standard field messaging/styling.
- `disabled?: boolean` — disables trigger and inputs.
- `className?: string` — wraps the control for layout adjustments.
- `minDate?: Date` / `maxDate?: Date` — bound selectable dates.
- `maxRangeDays?: number` — cap the range length in days (inclusive).
- `variant?: 'classic' | 'modern'` — layout hint; modern keeps inputs side-by-side on larger viewports.

## Behavior
- Trigger opens a popover with two native `type="date"` inputs; Esc or outside click closes and returns focus to the trigger.
- Tab/Shift+Tab move through inputs and preset buttons; focus moves into the first input when opened.
- If `minDate`/`maxDate` are set, inputs use them for `min`/`max` attributes. `maxRangeDays` further caps the “to” input to `from + maxRangeDays`.
- “To” cannot precede “From”; attempts are corrected to match `from`.
- Partial ranges are supported (from-only or to-only). Controlled values are reflected in the trigger (“Jan 1, 2025 – Jan 7, 2025”, “From …”, “Until …”).
- Presets call `onChange` immediately and close the popover.
- `variant="modern"` swaps the inputs for a dual-month range calendar (chadcn-style DayPicker) so users pick start/end in one go; `variant="classic"` keeps the native inputs.

## Examples
### Basic controlled filter
```tsx
const [range, setRange] = useState<DateRangeValue>();

<DateRangeFilter
  label="Created"
  value={range}
  onChange={setRange}
/>
```

### Custom presets and FilterBar-style integration
```tsx
const lastQuarter: DateRangePreset = {
  label: 'Last quarter',
  getValue: () => {
    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const start = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
    const end = new Date(now.getFullYear(), currentQuarter * 3, 0);
    return { from: start, to: end };
  },
};

<div className="flex items-center gap-3">
  <span className="text-sm text-muted-foreground ">Filters</span>
  <DateRangeFilter
    placeholder="Created date"
    presets={[lastQuarter]}
    value={range}
    onChange={setRange}
  />
  {/* other filters alongside */}
  <Button size="sm" onClick={() => apply(range)}>Apply</Button>
</div>
```

## Accessibility notes
- Trigger exposes `aria-haspopup="dialog"` and manages `aria-expanded`.
- Esc and outside click close the surface and restore focus to the trigger.
- Native date inputs retain browser affordances; screen readers announce labels (“From”, “To”).
