# Combobox / AsyncSelect (DS-1009) & MultiSelect with Tags (DS-1010)

Searchable async dropdowns built on the popover/input pattern for fetching and selecting options. `MultiSelect` extends Combobox to support multiple choices as inline tags.

## Exports
- `Combobox`, `MultiSelect`, and `ComboboxOption` from `@lumia-ui/components`.

## Combobox props & behavior
- `value: ComboboxOption | null` – controlled selection; `ComboboxOption` is `{ label: string; value: string }`.
- `onChange(option: ComboboxOption | null)` – fired on selection.
- `loadOptions(input: string) => Promise<ComboboxOption[]>` – called on focus and as the user types.
- `placeholder?: string` – defaults to `Search...`; other input props are forwarded.
- UI: text input trigger, dropdown list under the field, inline spinner while `loadOptions` is pending, and “No results” when the returned array is empty.
- Keyboard: Arrow keys move the active option, Enter selects the highlighted option, and Esc closes/reset to the current value.
- Shows spinner while loading, “No results” when nothing matches, highlights active option, and closes/commits selection on Enter or click; Esc closes and restores the current value.
- Arrow keys move the active option; focus returns to the input when the list closes.

## MultiSelect props & behavior
- `value: ComboboxOption[]` – controlled list of selected options.
- `onChange(options: ComboboxOption[])` – fired whenever selection changes.
- `loadOptions(input: string) => Promise<ComboboxOption[]>` – same async loader, called on focus and typing.
- `placeholder?: string` – shown when no tags are selected.
- UI: selected options render as removable tags inside the field; clear via chip “x” button or Backspace on an empty input to remove the last tag; dropdown options show checkbox states for selected items.
- Keyboard: Arrow keys move the active option, Enter toggles the highlighted option, Esc closes and clears the pending query, Backspace removes the last tag when the query is empty.

## Usage
```tsx
import { useMemo, useState } from 'react';
import { Combobox, MultiSelect, type ComboboxOption } from '@lumia-ui/components';

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

export function FruitMultiSelect() {
  const [choices, setChoices] = useState<ComboboxOption[]>([]);

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
    <MultiSelect
      value={choices}
      onChange={setChoices}
      loadOptions={loadOptions}
      placeholder="Pick fruits..."
    />
  );
}
```

## Accessibility notes
- Input uses `role="combobox"` with `aria-expanded`, `aria-controls`, and `aria-activedescendant` for active option tracking.
- List uses `role="listbox"`/`role="option"`; keyboard navigation supports Arrow keys, Enter to select/toggle, and Esc to close.
- Popover restores focus to the trigger/input on close; options are clickable and keyboard selectable.
- MultiSelect marks the list as `aria-multiselectable="true"` and reflects selection with `aria-selected` plus checkbox visuals; chip remove buttons include accessible labels.
