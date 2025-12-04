import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FontCombobox, type FontItem } from './font-combobox';

const meta = {
  title: 'Components/FontCombobox',
  component: FontCombobox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FontCombobox>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample fonts list
const sampleFonts: FontItem[] = [
  { id: 'roboto', label: 'Roboto', category: 'sans' },
  { id: 'roboto-mono', label: 'Roboto Mono', category: 'mono' },
  { id: 'open-sans', label: 'Open Sans', category: 'sans' },
  { id: 'lato', label: 'Lato', category: 'sans' },
  { id: 'montserrat', label: 'Montserrat', category: 'sans' },
  { id: 'source-sans-pro', label: 'Source Sans Pro', category: 'sans' },
  { id: 'oswald', label: 'Oswald', category: 'sans' },
  { id: 'raleway', label: 'Raleway', category: 'sans' },
  { id: 'pt-sans', label: 'PT Sans', category: 'sans' },
  { id: 'lora', label: 'Lora', category: 'serif' },
  { id: 'merriweather', label: 'Merriweather', category: 'serif' },
  { id: 'pt-serif', label: 'PT Serif', category: 'serif' },
  { id: 'playfair-display', label: 'Playfair Display', category: 'serif' },
  { id: 'source-code-pro', label: 'Source Code Pro', category: 'mono' },
  { id: 'fira-code', label: 'Fira Code', category: 'mono' },
  { id: 'jetbrains-mono', label: 'JetBrains Mono', category: 'mono' },
];

// Large fonts list for performance testing
const largeFontsList: FontItem[] = Array.from({ length: 150 }, (_, i) => ({
  id: `font-${i}`,
  label: `Font Family ${i + 1}`,
  category: (['serif', 'sans', 'mono'] as const)[i % 3],
}));

export const Default: Story = {
  render: () => {
    const [selectedFont, setSelectedFont] = useState<string | null>(null);

    return (
      <div className="w-80">
        <FontCombobox
          fonts={sampleFonts}
          value={selectedFont}
          onChange={setSelectedFont}
          placeholder="Select a font..."
        />
        {selectedFont && (
          <p className="mt-2 text-sm text-muted-foreground">
            Selected: {selectedFont}
          </p>
        )}
      </div>
    );
  },
};

export const WithPreselection: Story = {
  render: () => {
    const [selectedFont, setSelectedFont] = useState<string | null>('lora');

    return (
      <div className="w-80">
        <FontCombobox
          fonts={sampleFonts}
          value={selectedFont}
          onChange={setSelectedFont}
          placeholder="Select a font..."
        />
        {selectedFont && (
          <p className="mt-2 text-sm text-muted-foreground">
            Selected: {selectedFont}
          </p>
        )}
      </div>
    );
  },
};

export const CustomPlaceholder: Story = {
  render: () => {
    const [selectedFont, setSelectedFont] = useState<string | null>(null);

    return (
      <div className="w-80">
        <FontCombobox
          fonts={sampleFonts}
          value={selectedFont}
          onChange={setSelectedFont}
          placeholder="Choose your typography..."
        />
      </div>
    );
  },
};

export const LargeFontsList: Story = {
  render: () => {
    const [selectedFont, setSelectedFont] = useState<string | null>(null);

    return (
      <div className="w-80">
        <FontCombobox
          fonts={largeFontsList}
          value={selectedFont}
          onChange={setSelectedFont}
          placeholder="Search from 150+ fonts..."
        />
        {selectedFont && (
          <p className="mt-2 text-sm text-muted-foreground">
            Selected: {selectedFont}
          </p>
        )}
      </div>
    );
  },
};

export const CategoryFilter: Story = {
  render: () => {
    const [selectedFont, setSelectedFont] = useState<string | null>(null);
    const [categoryFilter, setCategoryFilter] = useState<
      'serif' | 'sans' | 'mono' | 'all'
    >('all');

    const filteredFonts =
      categoryFilter === 'all'
        ? sampleFonts
        : sampleFonts.filter((font) => font.category === categoryFilter);

    return (
      <div className="w-80 space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`rounded px-3 py-1 text-sm ${
              categoryFilter === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-muted text-foreground'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setCategoryFilter('sans')}
            className={`rounded px-3 py-1 text-sm ${
              categoryFilter === 'sans'
                ? 'bg-primary-500 text-white'
                : 'bg-muted text-foreground'
            }`}
          >
            Sans
          </button>
          <button
            onClick={() => setCategoryFilter('serif')}
            className={`rounded px-3 py-1 text-sm ${
              categoryFilter === 'serif'
                ? 'bg-primary-500 text-white'
                : 'bg-muted text-foreground'
            }`}
          >
            Serif
          </button>
          <button
            onClick={() => setCategoryFilter('mono')}
            className={`rounded px-3 py-1 text-sm ${
              categoryFilter === 'mono'
                ? 'bg-primary-500 text-white'
                : 'bg-muted text-foreground'
            }`}
          >
            Mono
          </button>
        </div>
        <FontCombobox
          fonts={filteredFonts}
          value={selectedFont}
          onChange={setSelectedFont}
          placeholder="Select a font..."
        />
        {selectedFont && (
          <p className="text-sm text-muted-foreground">
            Selected: {selectedFont}
          </p>
        )}
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    return (
      <div className="w-80">
        <FontCombobox
          fonts={sampleFonts}
          value="roboto"
          onChange={() => {}}
          disabled
        />
      </div>
    );
  },
};
