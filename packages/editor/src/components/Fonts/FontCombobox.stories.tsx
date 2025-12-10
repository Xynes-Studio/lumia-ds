/* istanbul ignore file */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FontCombobox } from './FontCombobox';
import { getDefaultFontConfig } from '../../font-config';
import type { FontConfig } from '../../font-config';

const meta: Meta<typeof FontCombobox> = {
  title: 'Components/Fonts/FontCombobox',
  component: FontCombobox,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof FontCombobox>;

const InteractiveTemplate = ({ config }: { config: FontConfig }) => {
  const [selectedFont, setSelectedFont] = useState(config.defaultFontId);

  return (
    <div className="w-[400px] space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Choose a font
        </label>
        <FontCombobox
          config={config}
          value={selectedFont}
          onChange={setSelectedFont}
          placeholder="Search fonts..."
        />
      </div>
      <div className="rounded-lg border border-border bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          Selected font ID:{' '}
          <span className="font-mono font-semibold text-foreground">
            {selectedFont}
          </span>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Selected font name:{' '}
          <span className="font-semibold text-foreground">
            {config.allFonts.find((f) => f.id === selectedFont)?.label}
          </span>
        </p>
      </div>
    </div>
  );
};

/**
 * Interactive playground with default font configuration.
 * Try typing to search fonts (e.g., "mono", "inter", "roboto").
 */
export const Playground: Story = {
  render: () => <InteractiveTemplate config={getDefaultFontConfig()} />,
  parameters: {
    docs: {
      description: {
        story:
          'Interactive font picker with the default 5 curated Google Fonts. Type to search, click to select, or use arrow keys and Enter.',
      },
    },
  },
};

/**
 * Shows all fonts from the default configuration.
 */
export const WithAllFonts: Story = {
  render: () => {
    const config = getDefaultFontConfig();
    const [selectedFont, setSelectedFont] = useState(config.defaultFontId);

    return (
      <div className="w-[400px] space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            All Default Fonts
          </p>
          <p className="text-sm text-muted-foreground">
            Includes: Inter, Roboto, Lora, Roboto Mono, Playfair Display
          </p>
        </div>
        <FontCombobox
          config={config}
          value={selectedFont}
          onChange={setSelectedFont}
        />
        <p className="text-sm text-muted-foreground">
          Selected: <span className="font-semibold">{selectedFont}</span>
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Displays all 5 default fonts when no brand restrictions are applied.',
      },
    },
  },
};

/**
 * Demonstrates brand restrictions using allowedFonts.
 */
export const WithBrandRestrictions: Story = {
  render: () => {
    const config: FontConfig = {
      allFonts: [
        {
          id: 'inter',
          label: 'Inter',
          cssStack: 'Inter, system-ui, -apple-system, sans-serif',
        },
        {
          id: 'roboto',
          label: 'Roboto',
          cssStack: 'Roboto, system-ui, -apple-system, sans-serif',
        },
        {
          id: 'lora',
          label: 'Lora',
          cssStack: 'Lora, Georgia, "Times New Roman", serif',
        },
        {
          id: 'roboto-mono',
          label: 'Roboto Mono',
          cssStack: 'Roboto Mono, Consolas, Monaco, "Courier New", monospace',
        },
      ],
      allowedFonts: ['inter', 'roboto'], // Only these two allowed
      defaultFontId: 'inter',
    };

    const [selectedFont, setSelectedFont] = useState(config.defaultFontId);

    return (
      <div className="w-[400px] space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Brand Restricted Fonts
          </p>
          <p className="text-sm text-muted-foreground">
            Only Inter and Roboto are allowed (Lora and Roboto Mono are hidden)
          </p>
        </div>
        <FontCombobox
          config={config}
          value={selectedFont}
          onChange={setSelectedFont}
        />
        <p className="text-sm text-muted-foreground">
          Selected: <span className="font-semibold">{selectedFont}</span>
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'When `allowedFonts` is set, only those fonts appear in the dropdown. This is useful for enforcing brand guidelines.',
      },
    },
  },
};

/**
 * Custom font list with system fonts.
 */
export const CustomFontList: Story = {
  render: () => {
    const config: FontConfig = {
      allFonts: [
        {
          id: 'arial',
          label: 'Arial',
          cssStack: 'Arial, Helvetica, sans-serif',
        },
        {
          id: 'georgia',
          label: 'Georgia',
          cssStack: 'Georgia, "Times New Roman", serif',
        },
        {
          id: 'courier',
          label: 'Courier New',
          cssStack: '"Courier New", Courier, monospace',
        },
        {
          id: 'verdana',
          label: 'Verdana',
          cssStack: 'Verdana, Geneva, sans-serif',
        },
        {
          id: 'times',
          label: 'Times New Roman',
          cssStack: '"Times New Roman", Times, serif',
        },
      ],
      defaultFontId: 'arial',
    };

    const [selectedFont, setSelectedFont] = useState(config.defaultFontId);

    return (
      <div className="w-[400px] space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">System Fonts</p>
          <p className="text-sm text-muted-foreground">
            Custom configuration with common system fonts
          </p>
        </div>
        <FontCombobox
          config={config}
          value={selectedFont}
          onChange={setSelectedFont}
        />
        <p className="text-sm text-muted-foreground">
          Selected: <span className="font-semibold">{selectedFont}</span>
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'FontCombobox works with any custom font configuration, such as system fonts.',
      },
    },
  },
};
