/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';

import { MarketingFooter } from './marketing-footer';

const columns = [
  {
    heading: 'Product',
    links: [
      { label: 'Auth', href: 'https://auth.xynes.com' },
      { label: 'CMS', href: 'https://cms.xynes.com' },
    ],
  },
  {
    heading: 'Developers',
    links: [
      { label: 'Docs', href: 'https://docs.xynes.com', external: true },
      {
        label: 'GitHub',
        href: 'https://github.com/Xynes-Studio',
        external: true,
      },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Status', href: 'https://status.xynes.com', external: true },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy', href: '/legal/privacy' },
      { label: 'Terms', href: '/legal/terms' },
      { label: 'Cookies', href: '/legal/cookies' },
    ],
  },
];

const meta = {
  title: 'Marketing/MarketingFooter',
  component: MarketingFooter,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MarketingFooter>;

export default meta;
type Story = StoryObj<typeof MarketingFooter>;

export const Default: Story = {
  args: {
    columns,
    brand: { variant: 'wordmark', href: '/', label: 'xynes' },
    supportEmail: 'support@xynes.com',
    copyright: <span>© 2026 Xynes Studio. Built in the open.</span>,
  },
};

export const Minimal: Story = {
  args: {
    columns: [columns[3]],
  },
};

export const RTL: Story = {
  args: {
    columns,
    brand: { variant: 'wordmark', href: '/', label: 'xynes' },
    supportEmail: 'support@xynes.com',
  },
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};

export const Dark: Story = {
  args: {
    columns,
    brand: { variant: 'wordmark', href: '/', label: 'xynes' },
    supportEmail: 'support@xynes.com',
    copyright: <span>© 2026 Xynes Studio.</span>,
  },
  decorators: [
    (Story) => (
      <div data-theme="dark" style={{ background: '#0b0b0f', color: '#fff' }}>
        <Story />
      </div>
    ),
  ],
};
