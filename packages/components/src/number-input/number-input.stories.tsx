/* istanbul ignore file */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { NumberInput } from './number-input';

const meta = {
  title: 'Components/NumberInput',
  component: NumberInput,
  tags: ['autodocs'],
  args: {
    min: undefined,
    max: undefined,
    step: 1,
    invalid: false,
    disabled: false,
    hint: '',
    'aria-label': 'Number input',
  },
  argTypes: {
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof NumberInput>;

export default meta;
type Story = StoryObj<typeof NumberInput>;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState<number | undefined>(10);

    return (
      <div className="grid gap-3 bg-background p-6">
        <NumberInput
          {...args}
          value={value}
          onChange={(next) => setValue(next)}
        />
        <p className="text-sm text-muted-foreground">
          Use arrow keys or the stacked controls to increment/decrement. Empty
          input clears the value.
        </p>
      </div>
    );
  },
};

export const States: Story = {
  render: () => {
    const [age, setAge] = useState<number | undefined>(32);
    const [percentage, setPercentage] = useState<number | undefined>(75);
    const [tickets, setTickets] = useState<number | undefined>(1);

    return (
      <div className="grid max-w-lg gap-4 bg-background p-6">
        <NumberInput
          value={age}
          onChange={setAge}
          min={0}
          max={120}
          aria-label="Age"
          hint="Clamped between 0 and 120"
        />
        <NumberInput
          value={percentage}
          onChange={setPercentage}
          min={0}
          max={100}
          step={5}
          aria-label="Completion percentage"
          hint="Step in 5s, shows disabled preview"
          disabled
        />
        <NumberInput
          value={tickets}
          onChange={setTickets}
          min={1}
          max={6}
          aria-label="Tickets"
          hint="Invalid state mirrors input styling"
          invalid
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Examples of clamped, disabled, and invalid instances. The hint sits below the control similar to other field wrappers.',
      },
    },
  },
};
