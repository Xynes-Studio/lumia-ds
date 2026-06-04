/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';

import { Brand } from './brand';

const meta = {
  title: 'Brand/Brand',
  component: Brand,
  tags: ['autodocs'],
  args: {
    variant: 'wordmark',
    size: 'md',
    'aria-label': 'xynes',
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Brand>;

export default meta;
type Story = StoryObj<typeof Brand>;

export const Wordmark: Story = {};

export const WordmarkLarge: Story = {
  args: { variant: 'wordmark', size: 'xl', 'aria-label': 'xynes' },
};

export const Icon: Story = {
  args: { variant: 'icon', size: 'lg', 'aria-label': 'xynes' },
};

export const IconDecorative: Story = {
  args: { variant: 'icon', size: 'md', 'aria-hidden': true },
};

export const WordmarkOnDarkSurface: Story = {
  render: () => (
    <div
      style={{
        background: 'var(--color-background, #0b0b0f)',
        color: 'var(--color-foreground, #ffffff)',
        padding: '3rem',
        borderRadius: '0.75rem',
      }}
    >
      <Brand variant="wordmark" size="lg" aria-label="xynes" />
    </div>
  ),
  args: { variant: 'wordmark', size: 'lg', 'aria-label': 'xynes' },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <div
          key={size}
          style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}
        >
          <code style={{ width: '2.5rem' }}>{size}</code>
          <Brand variant="wordmark" size={size} aria-label="xynes" />
          <Brand variant="icon" size={size} aria-hidden />
        </div>
      ))}
    </div>
  ),
  args: { variant: 'wordmark', size: 'md', 'aria-label': 'xynes' },
};
