/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { Input, Textarea } from './input';

const meta = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    placeholder: 'Type here',
    invalid: false,
    disabled: false,
    hint: '',
  },
  argTypes: {
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof Input>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <div className="grid max-w-lg gap-4 bg-background p-6">
      <Input placeholder="Default input" hint="Helper text" />
      <Input placeholder="Hover to preview hover ring" />
      <Input
        placeholder="Invalid input"
        invalid
        hint="This field is required"
      />
      <Input placeholder="Disabled input" disabled />
      <Textarea placeholder="Textarea" hint="Use multiple lines if needed" />
      <Textarea
        placeholder="Textarea invalid"
        invalid
        hint="Please provide more details"
      />
      <Textarea placeholder="Textarea disabled" disabled />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Covers default, hover, disabled, and invalid states for both inputs and textareas.',
      },
    },
  },
};

export const WithHint: Story = {
  args: {
    hint: 'Helper text for the field',
  },
};
