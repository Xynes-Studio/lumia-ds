/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { StackLayout } from '@lumia/layout';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@lumia/components';

const meta = {
  title: 'Runtime/StackLayout',
  component: StackLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof StackLayout>;

export default meta;
type Story = StoryObj<typeof StackLayout>;

export const DetailPage: Story = {
  args: {
    title: 'Account details',
  },
  render: (args) => (
    <StackLayout
      {...args}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm">
            Discard
          </Button>
          <Button size="sm">Save changes</Button>
        </div>
      }
    >
      <Card className="bg-background/80 shadow-sm">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Sticky header keeps actions visible while scrolling.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground ">
          <p>
            Use StackLayout for detail and form flows where you need a top
            actions bar and a vertical stack of sections.
          </p>
          <p>
            Combine with Cards, forms, and lists to build multi-section detail
            screens. Layout handles responsive spacing and max-width.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-background/80 shadow-sm">
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>
            Secondary sections align to the same content column.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground ">
          <p>
            Add as many sections as needed—the body uses a consistent stack with
            generous spacing and readable line lengths.
          </p>
          <p className="text-xs text-muted-foreground ">
            The sticky header only appears when `title` or `actions` are
            provided.
          </p>
        </CardContent>
      </Card>
    </StackLayout>
  ),
};
