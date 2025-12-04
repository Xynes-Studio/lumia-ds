import type { InputHTMLAttributes } from 'react';
import { forwardRef, useMemo, useCallback } from 'react';
import { Combobox, type ComboboxOption } from '../combobox/combobox';

export type FontItem = {
  id: string;
  label: string;
  category?: 'serif' | 'sans' | 'mono';
};

export type FontComboboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> & {
  fonts: FontItem[];
  value: string | null;
  onChange: (fontId: string | null) => void;
  placeholder?: string;
};

export const FontCombobox = forwardRef<HTMLInputElement, FontComboboxProps>(
  function FontCombobox(
    { fonts, value, onChange, placeholder = 'Search fonts...', ...inputProps },
    ref,
  ) {
    // Convert fonts array to ComboboxOption format
    const fontOptions = useMemo<ComboboxOption[]>(
      () =>
        fonts.map((font) => ({
          value: font.id,
          label: font.label,
        })),
      [fonts],
    );

    // Find the selected font option based on the value prop
    const selectedOption = useMemo<ComboboxOption | null>(() => {
      if (!value) return null;
      const font = fonts.find((f) => f.id === value);
      if (!font) return null;
      return { value: font.id, label: font.label };
    }, [value, fonts]);

    // Synchronous font filtering function
    const loadOptions = useCallback(
      (query: string): Promise<ComboboxOption[]> => {
        const normalizedQuery = query.toLowerCase().trim();

        if (!normalizedQuery) {
          return Promise.resolve(fontOptions);
        }

        const filtered = fontOptions.filter((option) =>
          option.label.toLowerCase().includes(normalizedQuery),
        );

        return Promise.resolve(filtered);
      },
      [fontOptions],
    );

    // Handle selection from Combobox
    const handleChange = useCallback(
      (option: ComboboxOption | null) => {
        onChange(option?.value ?? null);
      },
      [onChange],
    );

    return (
      <Combobox
        ref={ref}
        value={selectedOption}
        onChange={handleChange}
        loadOptions={loadOptions}
        placeholder={placeholder}
        {...inputProps}
      />
    );
  },
);
