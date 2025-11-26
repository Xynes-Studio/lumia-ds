/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  args: {
    defaultValue: 'overview',
    orientation: 'horizontal',
  },
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
    },
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof Tabs>;

const Content = ({ title, body }: { title: string; body: string }) => (
  <div className="flex flex-col gap-2">
    <h4 className="text-base font-semibold text-foreground">{title}</h4>
    <p className="text-muted">{body}</p>
  </div>
);

const renderTabs = (args: Story['args'], includeDisabled = false) => (
  <Tabs {...args} className="w-full max-w-3xl">
    <div
      className={
        args?.orientation === 'vertical'
          ? 'grid grid-cols-[auto,1fr] items-start gap-4'
          : 'flex flex-col gap-3'
      }
    >
      <TabsList
        className={
          args?.orientation === 'vertical'
            ? 'flex-col items-stretch gap-1'
            : undefined
        }
      >
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="usage">Usage</TabsTrigger>
        <TabsTrigger value="history" disabled={includeDisabled}>
          History {includeDisabled ? '(disabled)' : ''}
        </TabsTrigger>
      </TabsList>
      <div className="flex flex-col gap-3">
        <TabsContent value="overview">
          <Content
            title="Overview"
            body="High level summary content lives here."
          />
        </TabsContent>
        <TabsContent value="usage">
          <Content
            title="Usage"
            body="Best practices, copy, and quick references."
          />
        </TabsContent>
        <TabsContent value="history">
          <Content title="History" body="Changes or notes for this section." />
        </TabsContent>
      </div>
    </div>
  </Tabs>
);

export const Playground: Story = {
  render: (args) => renderTabs(args),
};

export const WithDisabledTab: Story = {
  render: (args) => renderTabs(args, true),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates default, hover, focus, and disabled tab trigger states.',
      },
    },
  },
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    defaultValue: 'overview',
  },
  render: (args) => renderTabs(args),
  parameters: {
    docs: {
      description: {
        story:
          'Vertical layout pins the list to the left and keeps panels stacked on the right. Keyboard arrows follow WAI-ARIA orientation guidance.',
      },
    },
  },
};
