import { useMemo } from 'react';
import { Combobox, type ComboboxOption } from '@lumia-ui/components';
import type { FontConfig } from '../../font-config';

/**
 * Props for the FontCombobox component.
 */
export interface FontComboboxProps {
  /** Font configuration containing available fonts */
  config: FontConfig;
  /** Currently selected font ID */
  value: string;
  /** Callback fired when a font is selected */
  onChange: (fontId: string) => void;
  /** Optional placeholder text */
  placeholder?: string;
}

/**
 * FontCombobox - A searchable font picker component.
 *
 * Displays fonts from `config.allFonts`, filtered by `config.allowedFonts` if present.
 * Supports text search over font labels and keyboard navigation.
 *
 * @example
 * ```tsx
 * const config = getDefaultFontConfig();
 * const [selectedFont, setSelectedFont] = useState('inter');
 *
 * <FontCombobox
 *   config={config}
 *   value={selectedFont}
 *   onChange={setSelectedFont}
 *   placeholder="Select a font..."
 * />
 * ```
 */
export function FontCombobox({
  config,
  value,
  onChange,
  placeholder = 'Select a font...',
}: FontComboboxProps) {
  // Filter fonts based on allowedFonts if present
  const availableFonts = useMemo(() => {
    if (!config.allowedFonts) {
      return config.allFonts;
    }
    return config.allFonts.filter((font) =>
      config.allowedFonts!.includes(font.id),
    );
  }, [config]);

  // Convert FontMeta[] to ComboboxOption[]
  const fontOptions = useMemo(
    () =>
      availableFonts.map((font) => ({
        value: font.id,
        label: font.label,
      })),
    [availableFonts],
  );

  // Find the currently selected option
  const selectedOption = useMemo(
    () => fontOptions.find((opt) => opt.value === value) || null,
    [fontOptions, value],
  );

  // Synchronous load function for Combobox
  // Filters options based on search query
  const loadOptions = useMemo(
    () => (query: string) => {
      const normalizedQuery = query.trim().toLowerCase();
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

  // Handle selection
  const handleChange = (option: ComboboxOption | null) => {
    if (!option) return;

    // Validate against allowedFonts if restrictions are set
    if (config.allowedFonts && config.allowedFonts.length > 0) {
      if (!config.allowedFonts.includes(option.value)) {
        // Attempted to select a disallowed font, ignore the selection
        return;
      }
    }

    onChange(option.value);
  };

  return (
    <Combobox
      value={selectedOption}
      onChange={handleChange}
      loadOptions={loadOptions}
      placeholder={placeholder}
      aria-label="Font Family"
    />
  );
}
