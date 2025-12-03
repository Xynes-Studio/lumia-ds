/* istanbul ignore file */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DateRangeFilter } from './date-range-filter';
import { Select } from './select';
import { Input } from './input';
import { Button } from './button';
import type { DateRangeValue } from './date-range-filter';

const meta = {
  title: 'Examples/FilterBar Composition',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Example of composing FilterBar-like controls using existing primitives. Replace with your FilterBar wrapper once available.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Playground: Story = {
  render: () => {
    const [range, setRange] = useState<DateRangeValue>();
    const [status, setStatus] = useState('any');
    const [query, setQuery] = useState('');

    return (
      <div className="bg-muted/40 p-6">
        <div className="flex flex-wrap items-end gap-3 rounded-lg bg-background p-4 shadow-sm">
          <div className="min-w-[220px]">
            <DateRangeFilter
              label="Created"
              placeholder="Any time"
              value={range}
              onChange={setRange}
            />
          </div>
          <div className="w-48">
            <Select
              label="Status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="any">Any</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px] max-w-xs">
            <Input
              placeholder="Search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setRange(undefined);
                setStatus('any');
                setQuery('');
              }}
            >
              Reset
            </Button>
            <Button>Apply filters</Button>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Drop DateRangeFilter alongside other controls to mimic a FilterBar experience until the dedicated FilterBar component ships.',
      },
    },
  },
};
