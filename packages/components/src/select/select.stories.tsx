/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './select';

const meta = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  args: {
    label: 'Favorite fruit',
    placeholder: 'Pick an option',
    invalid: false,
    disabled: false,
  },
  argTypes: {
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof Select>;

const options = (
  <>
    <option value="">Select an option</option>
    <option value="apple">Apple</option>
    <option value="banana">Banana</option>
    <option value="cherry">Cherry</option>
  </>
);

const renderSelect = (args: Story['args']) => (
  <Select {...args}>{options}</Select>
);

export const Playground: Story = {
  render: renderSelect,
};

export const States: Story = {
  render: () => (
    <div className="grid gap-4 bg-background p-6">
      <Select label="Default" defaultValue="apple">
        {options}
      </Select>
      <Select label="With hint" hint="Choose anything you like">
        {options}
      </Select>
      <Select label="Invalid" invalid hint="Please choose one">
        {options}
      </Select>
      <Select label="Disabled" disabled defaultValue="banana">
        {options}
      </Select>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Covers default, hover, invalid, and disabled states.',
      },
    },
  },
};
