import type { Meta, StoryObj } from '@storybook/react';
import { LumiaEditor } from '../lumia-editor';
import type { FontConfig } from '../font-config';
import type { LumiaEditorStateJSON } from '../types';

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

const generateLargeDocumentJSON = (): LumiaEditorStateJSON => {
  const rootChildren = [];

  // Add a title
  rootChildren.push({
    children: [
      {
        detail: 0,
        format: 0,
        mode: 'normal',
        style: '',
        text: 'Large Performance Test Document',
        type: 'text',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'heading',
    version: 1,
    tag: 'h1',
  });

  // Add 50 paragraphs
  for (let i = 0; i < 50; i++) {
    rootChildren.push({
      children: [
        {
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          text: `Paragraph ${i + 1}: This is a sample paragraph to test the performance of the editor with a large amount of content. It contains enough text to simulate a real-world scenario.`,
          type: 'text',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'paragraph',
      version: 1,
    });
  }

  // Add a list
  const listChildren = [];
  for (let i = 0; i < 20; i++) {
    listChildren.push({
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: `List item ${i + 1}`,
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'listitem',
          version: 1,
          value: i + 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'list',
      version: 1,
      listType: 'bullet',
      start: 1,
      tag: 'ul',
    });
  }

  // Lexical list structure is a bit different, let's stick to simple paragraphs and headings if lists are complex to mock manually without the nodes.
  // Actually, let's try to add a simple list if we can, but if not, more paragraphs are fine.
  // The above list structure is slightly wrong for Lexical (nested lists).
  // Let's simplify to just more paragraphs and headings to be safe and robust for "Large Document" definition.

  // Add another section with headings
  for (let i = 0; i < 10; i++) {
    rootChildren.push({
      children: [
        {
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          text: `Section ${i + 1}`,
          type: 'text',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'heading',
      version: 1,
      tag: 'h2',
    });
    rootChildren.push({
      children: [
        {
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          text: `Content for section ${i + 1}. Adding more text here to bulk up the document size.`,
          type: 'text',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'paragraph',
      version: 1,
    });
  }

  return {
    root: {
      children: rootChildren,
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  };
};

/**
 * A large document with 50+ paragraphs and headings to test performance.
 */
export const LargeDocument: Story = {
  args: {
    value: generateLargeDocumentJSON(),
    onChange: (val) => console.log('onChange', val),
  },
  parameters: {
    docs: {
      description: {
        story:
          'A large document pre-seeded with 50+ paragraphs and headings to verify rendering performance and typing latency.',
      },
    },
  },
};

/**
 * Demonstrates media upload functionality with a mock upload adapter.
 * Click the image/video button to see both "Embed link" and "Upload" tabs.
 */
export const WithMediaUpload: Story = {
  args: {
    value: null,
    onChange: (val) => console.log('onChange', val),
    media: {
      uploadAdapter: {
        uploadFile: async (file: File) => {
          // Simulate upload delay
          console.log('Uploading file:', file.name);
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Return mock URL
          const mockUrl = URL.createObjectURL(file);
          console.log('Upload complete:', mockUrl);

          return {
            url: mockUrl,
            mime: file.type,
            size: file.size,
          };
        },
      },
      callbacks: {
        onUploadStart: (file, type) =>
          console.log(`Upload started: ${file.name} (${type})`),
        onUploadComplete: (file, result) =>
          console.log(`Upload complete: ${file.name} -> ${result.url}`),
        onUploadError: (file, error) =>
          console.error(`Upload failed: ${file.name}`, error),
      },
      allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      allowedVideoTypes: ['video/mp4', 'video/webm'],
      maxFileSizeMB: 105,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Editor with media upload enabled. Click Image or Video in the toolbar or Insert menu to see the Upload tab. The mock adapter simulates a 2-second upload delay.',
      },
    },
  },
};
