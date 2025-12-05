import type { Meta, StoryObj } from '@storybook/react';
import { LumiaEditor } from '../lumia-editor';
import type { FontConfig } from '../font-config';

const meta: Meta<typeof LumiaEditor> = {
  title: 'Editor/LumiaEditor',
  component: LumiaEditor,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LumiaEditor>;

export const Default: Story = {
  args: {
    value: null,
    onChange: (val) => console.log('onChange', val),
    mode: 'document',
    variant: 'full',
    readOnly: false,
  },
};

/**
 * The editor uses a curated set of Google Fonts by default when no `fonts` prop is provided.
 * Default fonts include: Inter (default), Roboto, Lora, Roboto Mono, and Playfair Display.
 */
export const WithDefaultFonts: Story = {
  args: {
    value: null,
    onChange: (val) => console.log('onChange', val),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Uses the default font configuration with 5 curated Google Fonts: Inter, Roboto, Lora, Roboto Mono, and Playfair Display.',
      },
    },
  },
};

/**
 * Demonstrates custom font configuration with a limited set of fonts.
 */
export const WithCustomFonts: Story = {
  args: {
    value: null,
    onChange: (val) => console.log('onChange', val),
    fonts: {
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
      ],
      defaultFontId: 'arial',
    } as FontConfig,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Custom font configuration with Arial, Georgia, and Courier New. All fonts are available for use.',
      },
    },
  },
};

/**
 * Demonstrates brand-restricted font configuration where only specific fonts are allowed.
 */
export const WithBrandRestrictedFonts: Story = {
  args: {
    value: null,
    onChange: (val) => console.log('onChange', val),
    fonts: {
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
      ],
      allowedFonts: ['inter', 'roboto'], // Only these two fonts are allowed
      defaultFontId: 'inter',
    } as FontConfig,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Brand-restricted configuration where only Inter and Roboto are allowed, even though Lora is defined in allFonts. This is useful for enforcing brand guidelines.',
      },
    },
  },
};

/**
 * Demonstrates auto-normalization when defaultFontId is not in allowedFonts.
 * The editor automatically normalizes the defaultFontId to the first allowed font.
 */
export const WithAutoNormalization: Story = {
  args: {
    value: null,
    onChange: (val) => console.log('onChange', val),
    fonts: {
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
      ],
      allowedFonts: ['inter', 'roboto'], // Only these two fonts are allowed
      defaultFontId: 'lora', // Not in allowedFonts! Will be auto-normalized to 'inter'
    } as FontConfig,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates auto-normalization: defaultFontId is set to "Lora" (not in allowedFonts), but the editor automatically normalizes it to "Inter" (first in allowedFonts). Only Inter and Roboto appear in the font selector.',
      },
    },
  },
};
