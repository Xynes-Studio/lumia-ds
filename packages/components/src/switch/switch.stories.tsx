/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Switch } from './switch';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  args: {
    label: 'Enable notifications',
    checked: false,
  },
  render: (args) => {
    const [checked, setChecked] = useState(args.checked);
    return (
      <Switch
        {...args}
        checked={checked}
        onChange={(next) => {
          setChecked(next);
          args.onChange?.(next);
        }}
      />
    );
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof Switch>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4 bg-background p-6">
      <Switch label="Turned on" checked onChange={() => {}} />
      <Switch label="Turned off" checked={false} onChange={() => {}} />
      <Switch label="Disabled" checked={false} disabled onChange={() => {}} />
      <Switch label="Disabled on" checked disabled onChange={() => {}} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Shows checked, unchecked, and disabled visuals. Space/Enter toggles when focused.',
      },
    },
  },
};
