/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';

import { MarketingNav } from './marketing-nav';

const baseBrand = {
  variant: 'icon' as const,
  href: 'https://xynes.com',
  label: 'xynes',
};

const baseActions = [
  {
    label: 'Sign in',
    href: 'https://auth.xynes.com/login',
    variant: 'ghost' as const,
  },
  {
    label: 'Sign up',
    href: 'https://auth.xynes.com/signup',
    variant: 'primary' as const,
  },
];

const meta = {
  title: 'Marketing/MarketingNav',
  component: MarketingNav,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { brand: baseBrand, actions: baseActions },
} satisfies Meta<typeof MarketingNav>;

export default meta;
type Story = StoryObj<typeof MarketingNav>;

export const Default: Story = {};

export const Minimal: Story = {
  args: {
    brand: { variant: 'icon', href: '/' },
    actions: [],
  },
};

export const ExtremeLongLabels: Story = {
  args: {
    brand: { variant: 'wordmark', href: '/', label: 'xynes' },
    actions: [
      {
        label: 'Documentation and developer resources',
        href: 'https://docs.example.com',
        variant: 'ghost',
        target: '_blank',
      },
      {
        label: 'Start a workspace right now',
        href: 'https://auth.xynes.com/signup',
        variant: 'primary',
      },
    ],
  },
};

export const RTL: Story = {
  args: { brand: baseBrand, actions: baseActions },
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};

export const Dark: Story = {
  args: { brand: baseBrand, actions: baseActions },
  decorators: [
    (Story) => (
      <div
        data-theme="dark"
        style={{ background: '#0b0b0f', minHeight: '50vh' }}
      >
        <Story />
      </div>
    ),
  ],
};
