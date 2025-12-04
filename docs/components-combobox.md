# Combobox / AsyncSelect (DS-1009)

Searchable async dropdown built on the popover/input pattern for fetching and selecting options.

## Exports
- `Combobox` and `ComboboxOption` from `@lumia/components`.

## Props & behavior
- `value: ComboboxOption | null` – controlled selection; `ComboboxOption` is `{ label: string; value: string }`.
- `onChange(option: ComboboxOption | null)` – fired on selection.
- `loadOptions(input: string) => Promise<ComboboxOption[]>` – called on focus and as the user types.
- `placeholder?: string` – defaults to `Search...`; other input props are forwarded.
- UI: text input trigger, dropdown list under the field, inline spinner while `loadOptions` is pending, and “No results” when the returned array is empty.
- Keyboard: Arrow keys move the active option, Enter selects the highlighted option, and Esc closes/reset to the current value.
- Shows spinner while loading, “No results” when nothing matches, highlights active option, and closes/commits selection on Enter or click; Esc closes and restores the current value.
- Arrow keys move the active option; focus returns to the input when the list closes.

## Usage
```tsx
import { useMemo, useState } from 'react';
import { Combobox, type ComboboxOption } from '@lumia/components';

const fruits: ComboboxOption[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Apricot', value: 'apricot' },
  { label: 'Banana', value: 'banana' },
  { label: 'Mango', value: 'mango' },
];

export function FruitPicker() {
  const [choice, setChoice] = useState<ComboboxOption | null>(null);

  const loadOptions = useMemo(
    () => (input: string) =>
      new Promise<ComboboxOption[]>((resolve) => {
        const normalized = input.trim().toLowerCase();
        const filtered = fruits.filter((option) =>
          option.label.toLowerCase().includes(normalized),
        );
        setTimeout(() => resolve(filtered), 250);
      }),
    [],
  );

  return (
    <Combobox
      value={choice}
      onChange={setChoice}
      loadOptions={loadOptions}
      placeholder="Search fruits..."
    />
  );
}
```

## Accessibility notes
- Input uses `role="combobox"` with `aria-expanded`, `aria-controls`, and `aria-activedescendant` for active option tracking.
- List uses `role="listbox"`/`role="option"`; keyboard navigation supports Arrow keys, Enter to select, and Esc to close.
- Popover restores focus to the trigger/input on close; options are clickable and keyboard selectable.
