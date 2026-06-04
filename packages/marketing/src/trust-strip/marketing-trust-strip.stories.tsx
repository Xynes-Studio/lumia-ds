/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';

import { MarketingTrustStrip } from './marketing-trust-strip';

const meta = {
  title: 'Marketing/MarketingTrustStrip',
  component: MarketingTrustStrip,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    repoUrl: 'https://github.com/Xynes-Studio/lumia-ds',
    license: 'AGPL-3.0',
    securityUrl: '/SECURITY.md',
    residencyNote: 'Hosted in the EU.',
  },
} satisfies Meta<typeof MarketingTrustStrip>;

export default meta;
type Story = StoryObj<typeof MarketingTrustStrip>;

export const Default: Story = {};

export const Minimal: Story = {
  args: {
    repoUrl: 'https://github.com/x/y',
    license: 'MIT',
  },
};

export const WithExtras: Story = {
  args: {
    repoUrl: 'https://github.com/Xynes-Studio/lumia-ds',
    license: 'AGPL-3.0',
    residencyNote: 'Hosted in the EU. 7-day backup retention.',
    children: <span>·</span>,
  },
};

export const RTL: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};

export const Dark: Story = {
  decorators: [
    (Story) => (
      <div data-theme="dark" style={{ background: '#0b0b0f', color: '#fff' }}>
        <Story />
      </div>
    ),
  ],
};
