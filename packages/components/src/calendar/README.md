
# Calendar Component

A flexible, accessible, and modular calendar component system for React applications. Built with `date-fns` for robust date manipulation and `Tailwind CSS` for styling.

## Architecture

The Calendar system is designed with a clear separation of concerns, ensuring maintainability and scalability.

- **`types/`**: Core TypeScript definitions shared across the system.
- **`utils/`**: specialized date manipulation helper functions.
- **`hooks/`**: Custom hooks encapsulating all calendar logic (navigation, selection, view state).
- **`components/`**: Reusable sub-components (`DayCell`, `CalendarHeader`, selectors).
- **`variants/`**: Higher-level compositions (`CalendarCompact`, `CalendarFull`).
- **`calendar.tsx`**: The main public facade that users interact with.

## Features

- **Modular Design**: Composable hooks and components.
- **Multiple Variants**:
  - `compact`: Standard date-picker style.
  - `full`: Dashboard-style full-screen calendar.
- **Flexible Selection**: Supports Single Date and Date Range modes.
- **View Management**: Built-in support for Day, Week, and Month views.

## Styling & Accessibility

The calendar is built with a mobile-first, responsive approach.

- **Responsive**: Adapts to different screen sizes. Compact view is optimized for popovers, while Full view scales for dashboards.
- **Accessible**: Supports keyboard navigation (Arrow keys, Enter, Space).
- **Dark Mode**: Fully compatible with dark mode via Tailwind's `dark:` modifiers.
- **Layout Stability**: 
  - **Compact**: Enforced dimensions (`320px x 360px`) ensure the popover doesn't jitter when switching views.
  - **Full**: Strictly `100%` width/height with `overflow-hidden` to respect the parent container's constraints.

## Installation

```bash
pnpm add @lumia-ui/components date-fns
```

## Usage

### Basic Usage (Compact)

Ideal for DatePickers and Popovers.

```tsx
import { Calendar } from '@lumia-ui/components';
import { useState } from 'react';

export const MyDatePicker = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border shadow"
    />
  );
};
```

### Full-Screen Dashboard Calendar

Ideal for scheduling and admin interfaces.

```tsx
import { Calendar } from '@lumia-ui/components';

export const DashboardCalendar = () => {
  return (
    <div className="h-screen p-4">
      <Calendar
        variant="full"
        mode="none" 
        onViewChange={(view) => console.log('View changed to:', view)}
      />
    </div>
  );
};
```

### Range Selection

```tsx
import { Calendar, DateRange } from '@lumia-ui/components';

export const RangePicker = () => {
  const [range, setRange] = useState<DateRange | undefined>();

  return (
    <Calendar
      mode="range"
      selected={range}
      onSelect={setRange}
      numberOfMonths={2}
    />
  );
};
```

### Custom Day Rendering

Customize day cells to show events, indicators, or custom styles.

```tsx
<Calendar
  renderDay={(props) => (
    <div
      onClick={props.onClick}
      className={`relative h-9 w-9 flex items-center justify-center cursor-pointer ${
        props.isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
      }`}
    >
      {props.date.getDate()}
      {/* Example event indicator */}
      {props.date.getDay() === 0 && (
        <span className="absolute bottom-1 w-1 h-1 bg-red-500 rounded-full" />
      )}
    </div>
  )}
/>
```

## API Reference

### `CalendarProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'single' \| 'range' \| 'default'` | `'default'` | Defines the selection interaction mode. |
| `variant` | `'compact' \| 'full'` | `'compact'` | Visual layout variant of the calendar. |
| `selected` | `Date \| DateRange` | `undefined` | The currently selected date or range. |
| `onSelect` | `(date: Date \| DateRange) => void` | - | Callback fired when selection changes. |
| `minDate` | `Date` | - | Disables dates before this date. |
| `maxDate` | `Date` | - | Disables dates after this date. |
| `disabled` | `boolean \| Date \| Date[] \| Matcher` | `false` | Specific dates to disable. |
| `defaultMonth`| `Date` | `new Date()` | The initial month to display. |
| `renderDay` | `(props: DayCellRenderProps) => ReactNode` | - | Custom render function for day cells. |

### `DayCellRenderProps`

Access these properties in your `renderDay` function:

- `date`: `Date` object for the cell.
- `isSelected`: `boolean`
- `isToday`: `boolean`
- `isOutside`: `boolean` (outside current month)
- `isDisabled`: `boolean`
- `isRangeStart`: `boolean`
- `isRangeEnd`: `boolean`
- `isRangeMiddle`: `boolean`
- `onClick`: `() => void` click handler.

## Start Development

Run Storybook to develop and test components in isolation:

```bash
pnpm storybook
```

Run tests:

```bash
pnpm test src/calendar
```
