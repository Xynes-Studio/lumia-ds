/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DateRangeFilter, type DateRangeValue } from './date-range-filter';

const meta = {
  title: 'Components/DateRangeFilter',
  component: DateRangeFilter,
  tags: ['autodocs'],
  args: {
    label: 'Date range',
    placeholder: 'Select date range',
    variant: 'modern',
  },
  argTypes: {
    variant: {
      control: { type: 'inline-radio' },
      options: ['classic', 'modern'],
    },
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof DateRangeFilter>;

export default meta;
type Story = StoryObj<typeof DateRangeFilter>;

const StatefulExample = (props: Story['args']) => {
  const [value, setValue] = useState<DateRangeValue | undefined>(props?.value);

  return (
    <DateRangeFilter
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        props?.onChange?.(next);
      }}
    />
  );
};

export const Playground: Story = {
  render: (args) => <StatefulExample {...args} />,
};

export const WithoutPresets: Story = {
  render: (args) => <StatefulExample {...args} presets={[]} />,
  args: {
    label: 'Custom range',
  },
  parameters: {
    docs: {
      description: {
        story: 'Renders without the quick preset buttons.',
      },
    },
  },
};

export const ConstrainedRange: Story = {
  render: (args) => (
    <StatefulExample
      {...args}
      minDate={new Date(2024, 0, 1)}
      maxDate={new Date(2024, 0, 31)}
      maxRangeDays={7}
      value={{
        from: new Date(2024, 0, 8),
        to: new Date(2024, 0, 12),
      }}
    />
  ),
  args: {
    label: 'Jan 2024 only',
    variant: 'modern',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates min/max date bounds and a 7-day max range. The "To" picker is capped to stay within the allowed window.',
      },
    },
  },
};
