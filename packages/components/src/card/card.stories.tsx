/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardSubtitle,
  CardTitle,
} from './card';
import { Button } from '../button/button';
import { Icon } from '@lumia-ui/icons';

const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof Card>;

const CardBody = () => (
  <>
    <CardHeader
      icon={<Icon id="sparkle" size={18} aria-hidden />}
      actions={
        <Button variant="ghost" size="sm">
          Manage
        </Button>
      }
    >
      <CardTitle>Card title</CardTitle>
      <CardSubtitle>Subtitle or supporting copy goes here.</CardSubtitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm leading-6 text-foreground">
        Cards group related information. Use this area to highlight key details
        or nest form fields, lists, and summaries.
      </p>
    </CardContent>
    <CardFooter
      actions={
        <div className="flex gap-3">
          <Button variant="secondary" size="sm">
            Dismiss
          </Button>
          <Button size="sm">View details</Button>
        </div>
      }
    >
      <p className="text-sm leading-5 text-muted-foreground ">
        Secondary text can sit with footer actions.
      </p>
    </CardFooter>
  </>
);

export const Example: Story = {
  render: () => (
    <div className="bg-muted p-6">
      <Card className="max-w-md">
        <CardBody />
      </Card>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4 bg-muted p-6">
      <Card className="max-w-md">
        <CardBody />
      </Card>
      <Card className="max-w-md border-2 border-border shadow-md">
        <CardBody />
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Default and elevated states. Hover over each card to see border and shadow emphasis.',
      },
    },
  },
};
