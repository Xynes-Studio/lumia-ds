/* istanbul ignore file */
import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { ComboboxOption } from './combobox';
import { Combobox } from './combobox';

const options: ComboboxOption[] = [
  { label: 'Almond', value: 'almond' },
  { label: 'Apple', value: 'apple' },
  { label: 'Apricot', value: 'apricot' },
  { label: 'Banana', value: 'banana' },
  { label: 'Blackberry', value: 'blackberry' },
  { label: 'Blueberry', value: 'blueberry' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Date', value: 'date' },
  { label: 'Fig', value: 'fig' },
  { label: 'Grape', value: 'grape' },
  { label: 'Kiwi', value: 'kiwi' },
  { label: 'Mango', value: 'mango' },
  { label: 'Orange', value: 'orange' },
  { label: 'Peach', value: 'peach' },
  { label: 'Pear', value: 'pear' },
  { label: 'Pineapple', value: 'pineapple' },
  { label: 'Raspberry', value: 'raspberry' },
  { label: 'Strawberry', value: 'strawberry' },
  { label: 'Watermelon', value: 'watermelon' },
];

const countries: ComboboxOption[] = [
  { label: 'Argentina', value: 'ar' },
  { label: 'Australia', value: 'au' },
  { label: 'Austria', value: 'at' },
  { label: 'Belgium', value: 'be' },
  { label: 'Brazil', value: 'br' },
  { label: 'Canada', value: 'ca' },
  { label: 'Chile', value: 'cl' },
  { label: 'China', value: 'cn' },
  { label: 'Colombia', value: 'co' },
  { label: 'Czech Republic', value: 'cz' },
  { label: 'Denmark', value: 'dk' },
  { label: 'Egypt', value: 'eg' },
  { label: 'Estonia', value: 'ee' },
  { label: 'Finland', value: 'fi' },
  { label: 'France', value: 'fr' },
  { label: 'Germany', value: 'de' },
  { label: 'Greece', value: 'gr' },
  { label: 'Hungary', value: 'hu' },
  { label: 'Iceland', value: 'is' },
  { label: 'India', value: 'in' },
  { label: 'Indonesia', value: 'id' },
  { label: 'Ireland', value: 'ie' },
  { label: 'Israel', value: 'il' },
  { label: 'Italy', value: 'it' },
  { label: 'Japan', value: 'jp' },
  { label: 'Kenya', value: 'ke' },
  { label: 'Luxembourg', value: 'lu' },
  { label: 'Mexico', value: 'mx' },
  { label: 'Netherlands', value: 'nl' },
  { label: 'New Zealand', value: 'nz' },
  { label: 'Norway', value: 'no' },
  { label: 'Peru', value: 'pe' },
  { label: 'Philippines', value: 'ph' },
  { label: 'Poland', value: 'pl' },
  { label: 'Portugal', value: 'pt' },
  { label: 'Saudi Arabia', value: 'sa' },
  { label: 'Singapore', value: 'sg' },
  { label: 'South Africa', value: 'za' },
  { label: 'South Korea', value: 'kr' },
  { label: 'Spain', value: 'es' },
  { label: 'Sweden', value: 'se' },
  { label: 'Switzerland', value: 'ch' },
  { label: 'Thailand', value: 'th' },
  { label: 'United Arab Emirates', value: 'ae' },
  { label: 'United Kingdom', value: 'uk' },
  { label: 'United States', value: 'us' },
  { label: 'Vietnam', value: 'vn' },
];

const meta = {
  title: 'Components/Combobox',
  component: Combobox,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof Combobox>;

const AsyncTemplate = ({ initialValue }: { initialValue?: ComboboxOption }) => {
  const [selected, setSelected] = useState<ComboboxOption | null>(
    initialValue ?? null,
  );

  const loadOptions = useMemo(
    () => (query: string) =>
      new Promise<ComboboxOption[]>((resolve) => {
        const normalized = query.trim().toLowerCase();
        const filtered = options.filter((option) =>
          option.label.toLowerCase().includes(normalized),
        );

        setTimeout(() => resolve(filtered.slice(0, 12)), 400);
      }),
    [],
  );

  return (
    <div className="w-[360px] space-y-3">
      <Combobox
        value={selected}
        onChange={setSelected}
        loadOptions={loadOptions}
        placeholder="Search fruits..."
      />
      {selected ? (
        <p className="text-sm text-muted">
          Selected: <span className="font-medium">{selected.label}</span>
        </p>
      ) : (
        <p className="text-sm text-muted">No fruit selected</p>
      )}
    </div>
  );
};

export const Playground: Story = {
  render: () => <AsyncTemplate />,
  parameters: {
    docs: {
      description: {
        story:
          'Searchable combobox that calls `loadOptions` as you focus or type. Arrow keys cycle results, Enter selects, and Escape closes.',
      },
    },
  },
};

export const WithInitialValue: Story = {
  render: () => (
    <AsyncTemplate initialValue={{ label: 'Mango', value: 'mango' }} />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Starts with a pre-selected option and keeps the selection synced as queries change.',
      },
    },
  },
};

export const CountrySearch: Story = {
  render: () => {
    const [selected, setSelected] = useState<ComboboxOption | null>(null);

    const loadOptions = useMemo(
      () => (query: string) =>
        new Promise<ComboboxOption[]>((resolve) => {
          const normalized = query.trim().toLowerCase();
          const filtered = countries.filter((country) =>
            country.label.toLowerCase().includes(normalized),
          );
          setTimeout(() => resolve(filtered), 250);
        }),
      [],
    );

    return (
      <div className="w-[420px] space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            Type to find a country
          </p>
          <p className="text-sm text-muted">
            Start typing (e.g. “Uni”, “land”, “in”) to filter the dropdown
            results.
          </p>
        </div>
        <Combobox
          value={selected}
          onChange={setSelected}
          loadOptions={loadOptions}
          placeholder="Search countries..."
        />
        <p className="text-sm text-muted">
          {selected ? (
            <>
              Selected:{' '}
              <span className="font-medium text-foreground">
                {selected.label}
              </span>
            </>
          ) : (
            'No country selected'
          )}
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates live filtering against a list of countries as you type.',
      },
    },
  },
};
