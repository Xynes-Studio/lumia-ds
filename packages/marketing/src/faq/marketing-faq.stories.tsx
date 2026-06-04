/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';

import { MarketingFAQ } from './marketing-faq';

const meta = {
  title: 'Marketing/MarketingFAQ',
  component: MarketingFAQ,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MarketingFAQ>;

export default meta;
type Story = StoryObj<typeof MarketingFAQ>;

const items = [
  {
    id: 'residency',
    question: 'Where is my data hosted?',
    answer: 'In the EU. See SECURITY.md for the full data-flow map.',
  },
  {
    id: 'oss',
    question: 'Is xynes open source?',
    answer: 'Yes — the platform ships under AGPL-3.0.',
  },
  {
    id: 'backup',
    question: 'How often are backups taken?',
    answer: 'Nightly, with 7-day retention.',
  },
];

export const SingleOpen: Story = {
  args: {
    heading: 'Frequently asked questions',
    description: 'Short answers to common questions.',
    items,
  },
};

export const MultipleOpen: Story = {
  args: { heading: 'FAQ', items, multiple: true },
};

export const Minimal: Story = {
  args: { items: items.slice(0, 1) },
};

export const RTL: Story = {
  args: { heading: 'الأسئلة', items },
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};

export const Dark: Story = {
  args: { heading: 'FAQ', items },
  decorators: [
    (Story) => (
      <div data-theme="dark" style={{ background: '#0b0b0f', color: '#fff' }}>
        <Story />
      </div>
    ),
  ],
};
