/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';

import {
  MarketingFeatureGrid,
  MarketingFeatureCard,
} from './marketing-feature-grid';

const meta = {
  title: 'Marketing/MarketingFeatureGrid',
  component: MarketingFeatureGrid,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MarketingFeatureGrid>;

export default meta;
type Story = StoryObj<typeof MarketingFeatureGrid>;

const cards = [
  {
    id: 'directories',
    headline: 'Directory-first',
    body: 'Your folders map to URLs.',
  },
  {
    id: 'workspaces',
    headline: 'Workspace-scoped',
    body: 'Permissions follow your team.',
  },
  {
    id: 'open-source',
    headline: 'Open source',
    body: 'AGPL-3.0. No vendor lock-in.',
  },
];

export const ThreeColumns: Story = {
  args: {
    heading: 'Why xynes',
    description: 'Concrete reasons, not generic ones.',
    columns: 3,
    children: cards.map((c) => (
      <MarketingFeatureCard key={c.id} headline={c.headline}>
        {c.body}
      </MarketingFeatureCard>
    )),
  },
};

export const FourColumns: Story = {
  args: {
    heading: 'Capabilities',
    columns: 4,
    children: [
      ...cards,
      { id: 'eu', headline: 'EU hosted', body: 'Data stays in region.' },
    ].map((c) => (
      <MarketingFeatureCard key={c.id} headline={c.headline}>
        {c.body}
      </MarketingFeatureCard>
    )),
  },
};

export const Minimal: Story = {
  args: {
    columns: 1,
    children: [
      <MarketingFeatureCard key="one" headline="One thing">
        Done well.
      </MarketingFeatureCard>,
    ],
  },
};

export const ExtremeLongCopy: Story = {
  args: {
    heading: 'Why this matters at scale',
    description:
      'Every card body is intentionally long to stress-test the truncation contract across viewport widths.',
    columns: 3,
    children: cards.map((c) => (
      <MarketingFeatureCard
        key={c.id}
        headline={`${c.headline}: long stress headline that wraps`}
      >
        {c.body} Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
        eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </MarketingFeatureCard>
    )),
  },
};

export const RTL: Story = {
  args: {
    heading: 'لماذا xynes',
    columns: 3,
    children: cards.map((c) => (
      <MarketingFeatureCard key={c.id} headline={c.headline}>
        {c.body}
      </MarketingFeatureCard>
    )),
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
    heading: 'Why xynes',
    columns: 3,
    children: cards.map((c) => (
      <MarketingFeatureCard key={c.id} headline={c.headline}>
        {c.body}
      </MarketingFeatureCard>
    )),
  },
  decorators: [
    (Story) => (
      <div data-theme="dark" style={{ background: '#0b0b0f', color: '#fff' }}>
        <Story />
      </div>
    ),
  ],
};
