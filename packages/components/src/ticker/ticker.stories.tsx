/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { Ticker } from './ticker';
import { Badge } from '../badge/badge';
import { Flex } from '../flex/flex';

const meta = {
  title: 'Components/Ticker',
  component: Ticker,
  tags: ['autodocs'],
  args: {
    direction: 'row',
    alignment: 'center',
    speed: 40,
    loop: true,
    pauseOnHover: true,
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Ticker>;

export default meta;

type Story = StoryObj<typeof Ticker>;

export const Playground: Story = {
  render: (args) => (
    <div className="w-full max-w-3xl space-y-3">
      <Ticker
        {...args}
        className="rounded-md border border-border bg-muted/30 px-3 py-2"
        trackClassName="gap-3"
      >
        <Flex align="center" gap="sm">
          <Badge variant="subtle">Release</Badge>
          <span className="text-sm text-foreground">
            {'v1.8 shipped to staging'}
          </span>
        </Flex>
        <Flex align="center" gap="sm">
          <Badge variant="subtle">Infra</Badge>
          <span className="text-sm text-foreground">
            {'Queue latency back to normal'}
          </span>
        </Flex>
        <Flex align="center" gap="sm">
          <Badge variant="subtle">Status</Badge>
          <span className="text-sm text-foreground">No active incidents</span>
        </Flex>
      </Ticker>
      <p className="text-xs text-muted-foreground">
        Pause the ticker on hover to inspect individual items.
      </p>
    </div>
  ),
};

export const VerticalTicker: Story = {
  args: {
    direction: 'column',
    alignment: 'start',
    speed: 28,
  },
  render: (args) => (
    <div className="w-full max-w-sm">
      <Ticker
        {...args}
        className="h-32 rounded-md border border-border bg-background px-3 py-2"
        trackClassName="gap-2"
      >
        <span className="text-sm text-foreground">System healthy</span>
        <span className="text-sm text-foreground">4 deployments today</span>
        <span className="text-sm text-foreground">No incidents</span>
      </Ticker>
    </div>
  ),
};
