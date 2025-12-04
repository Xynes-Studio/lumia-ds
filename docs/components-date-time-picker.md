# Date & Time Pickers (@lumia/components)

Single-date and time inputs suited for forms and filters. Both render their surfaces inside the Popover wrapper (Radix-based, shadcn styling) and return focus to the trigger when closed.

## Import
```ts
import {
  DatePicker,
  type DatePickerProps,
  TimePicker,
  type TimePickerProps,
} from '@lumia/components';
```

## DatePicker props
- `value?: Date` — controlled selected date.
- `onChange(value?: Date)` — fires when a day is picked; `undefined` clears.
- `placeholder?: string` — trigger text when unset (default: “Select date”).
- `label?: string`, `hint?: string`, `invalid?: boolean`, `disabled?: boolean`, `className?: string` — standard field affordances.
- `minDate?: Date` / `maxDate?: Date` — bound selectable days; out-of-range dates are disabled.

### Behavior
- Opens a calendar in a Popover; clicking a day selects and closes.
- Calendar is keyboard accessible via react-day-picker with proper grid semantics; initial focus moves into the grid.
- Disabled dates respect min/max bounds.

### Example
```tsx
const [date, setDate] = useState<Date>();

<DatePicker
  label="Due date"
  value={date}
  onChange={setDate}
  minDate={new Date()}
  placeholder="Pick a date"
/>;
```

## TimePicker props
- `value?: string | Date` — controlled value. String in “HH:mm” or a Date (hours/minutes are read).
- `onChange(value?: string | Date)` — returns string by default; returns `Date` when `returnType="date"` or when `value` was a `Date`.
- `placeholder?: string` — text when unset (default: “Select time”).
- `format?: '24h' | '12h'` — display mode; defaults to 24h.
- `intervalMinutes?: number` — spacing between options (default 30, capped to reasonable range).
- `returnType?: 'string' | 'date'` — force output shape.
- `label?: string`, `hint?: string`, `invalid?: boolean`, `disabled?: boolean`, `className?: string`.

### Behavior
- Opens a Popover listbox of time options; arrow keys move, Enter/Space selects, Escape closes.
- Clicking an option or pressing Enter selects and closes. “Clear” link resets the value.
- List scrolls the active/selected option into view on open.

### Examples
```tsx
// 24-hour string output
const [time, setTime] = useState<string>();
<TimePicker
  label="Reminder"
  value={time}
  onChange={setTime}
  intervalMinutes={15}
/>;

// 12-hour display, Date output
const [meeting, setMeeting] = useState<Date | undefined>(
  new Date(2024, 0, 1, 9, 30),
);
<TimePicker
  label="Meeting"
  format="12h"
  value={meeting}
  onChange={setMeeting}
  returnType="date"
  hint="12-hour clock"
/>;
```

## Accessibility notes
- Triggers manage `aria-haspopup="dialog"` and `aria-expanded`; focus returns to trigger on close.
- DatePicker uses the day-grid roles from react-day-picker; keyboard users can move with arrows and select with Enter/Space.
- TimePicker exposes `role="listbox"`/`role="option"` and supports arrow key movement plus Enter/Space selection; Escape closes.
*** End Patchниценторы to=functions.apply_patch fiersjson## Test Output Reasoning  
