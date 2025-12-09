/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { IconSprite, SpriteIcon, SPRITE_ICONS } from '@lumia/icons';

const meta: Meta<typeof SpriteIcon> = {
  title: 'Foundations/Icons/Sprite',
  component: SpriteIcon,
  tags: ['autodocs'],
  args: {
    size: 24,
    className: 'text-primary-600',
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
SVG sprite icons for hot-path UI elements. Sprites reduce DOM duplication by 
defining each icon once as a \`<symbol>\` and referencing it via \`<use href>\`.

## Setup

Add \`<IconSprite />\` once at your app root:

\`\`\`tsx
import { IconSprite } from '@lumia/icons';

function App() {
  return (
    <>
      <IconSprite />
      <YourRoutes />
    </>
  );
}
\`\`\`

## Usage

\`\`\`tsx
import { SpriteIcon } from '@lumia/icons';

<SpriteIcon name="chevron-down" size={24} className="text-primary" />
\`\`\`

## Available Icons

${SPRITE_ICONS.map((name) => `- \`${name}\``).join('\n')}

## Dev Tools Verification

Open browser DevTools → Elements panel. You should see:
1. A hidden \`<svg style="display: none">\` containing \`<symbol>\` elements
2. Each \`<SpriteIcon>\` renders as \`<svg><use href="#icon-..."></svg>\`
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <>
        <IconSprite />
        <Story />
      </>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SpriteIcon>;

export const AllSprites: Story = {
  render: (args) => (
    <div className="grid grid-cols-3 gap-6 bg-background p-6 sm:grid-cols-5">
      {SPRITE_ICONS.map((name) => (
        <div key={name} className="flex flex-col items-center gap-3">
          <SpriteIcon {...args} name={name} />
          <span className="text-xs text-foreground">{name}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'All icons from the SVG sprite. Each icon is defined once as a `<symbol>` and reused across the app via `<use href="#icon-*">`.',
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4 bg-background p-6">
      <div className="flex flex-col items-center gap-2">
        <SpriteIcon
          name="chevron-down"
          size={16}
          className="text-primary-500"
        />
        <span className="text-xs text-muted-foreground">16px</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <SpriteIcon
          name="chevron-down"
          size={24}
          className="text-primary-600"
        />
        <span className="text-xs text-muted-foreground">24px</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <SpriteIcon
          name="chevron-down"
          size={32}
          className="text-primary-700"
        />
        <span className="text-xs text-muted-foreground">32px</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <SpriteIcon
          name="chevron-down"
          size={48}
          className="text-primary-800"
        />
        <span className="text-xs text-muted-foreground">48px</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Sprite icons scale cleanly since they are vector-based SVG symbols.',
      },
    },
  },
};

export const UseReference: Story = {
  render: () => (
    <div className="flex flex-col gap-4 bg-background p-6">
      <p className="text-sm text-muted-foreground">
        Each icon below uses <code>&lt;use href="#icon-*"&gt;</code> to
        reference the sprite:
      </p>
      <div className="flex items-center gap-4">
        <SpriteIcon name="check" size={24} className="text-green-600" />
        <SpriteIcon name="info" size={24} className="text-blue-600" />
        <SpriteIcon name="alert" size={24} className="text-amber-600" />
        <SpriteIcon name="delete" size={24} className="text-red-600" />
      </div>
      <p className="text-xs text-muted-foreground">
        Open DevTools to see:{' '}
        <code>&lt;svg&gt;&lt;use href="#icon-check"&gt;&lt;/svg&gt;</code>
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Verify in browser DevTools that each icon uses `<use href>` to reference symbols from the sprite.',
      },
    },
  },
};
