/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from '@lumia-ui/icons';
import { Button } from '../button/button';
import {
  InputGroup,
  InputGroupInput,
  InputGroupPrefix,
  InputGroupSuffix,
} from './input-group';

const meta = {
  title: 'Components/InputGroup',
  component: InputGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof InputGroup>;

export const WithIconAndSuffix: Story = {
  render: () => (
    <div className="grid max-w-xl gap-4 bg-background p-6">
      <InputGroup>
        <InputGroupPrefix>
          <Icon id="search" size={16} className="text-muted-foreground" />
        </InputGroupPrefix>
        <InputGroupInput placeholder="Search the docs" />
        <InputGroupSuffix className="text-muted-foreground">
          ⌘K
        </InputGroupSuffix>
      </InputGroup>
      <InputGroup>
        <InputGroupPrefix>$</InputGroupPrefix>
        <InputGroupInput aria-label="Amount" defaultValue="1200" />
        <InputGroupSuffix className="text-muted-foreground">
          USD
        </InputGroupSuffix>
      </InputGroup>
    </div>
  ),
};

export const WithButton: Story = {
  render: () => (
    <div className="grid max-w-xl gap-4 bg-background p-6">
      <InputGroup>
        <InputGroupInput placeholder="Search products" />
        <InputGroupSuffix className="bg-transparent px-0 py-0">
          <Button
            size="sm"
            className="h-full rounded-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            Search
          </Button>
        </InputGroupSuffix>
      </InputGroup>
      <InputGroup invalid>
        <InputGroupPrefix>
          <Icon id="alert-circle" size={16} className="text-destructive" />
        </InputGroupPrefix>
        <InputGroupInput invalid placeholder="Invalid value" />
      </InputGroup>
    </div>
  ),
};
