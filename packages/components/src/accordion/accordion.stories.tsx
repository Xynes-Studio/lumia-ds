/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion';
import { Card, CardContent } from '../card/card';

const items = [
  {
    value: 'item-1',
    title: 'Project overview',
    description:
      'High-level context, owners, and goals so collaborators can ramp quickly.',
  },
  {
    value: 'item-2',
    title: 'Timelines',
    description:
      'Milestones, key dependencies, and checkpoints to keep delivery on track.',
  },
  {
    value: 'item-3',
    title: 'Risks & mitigations',
    description:
      'Assumptions, known risks, and the plan to de-risk or respond if needed.',
  },
];

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  args: {
    type: 'single',
    collapsible: true,
    defaultValue: 'item-1',
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof Accordion>;

const renderAccordion = (args: Story['args']) => (
  <Accordion {...args} className="w-full max-w-xl">
    {items.map((item) => (
      <AccordionItem key={item.value} value={item.value}>
        <AccordionTrigger>{item.title}</AccordionTrigger>
        <AccordionContent>{item.description}</AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);

export const Single: Story = {
  render: (args) => renderAccordion(args),
};

export const Multiple: Story = {
  args: {
    type: 'multiple',
    defaultValue: ['item-1', 'item-2'],
  },
  render: (args) => renderAccordion(args),
  parameters: {
    docs: {
      description: {
        story:
          'Multiple mode keeps independent expansion states so readers can scan several sections at once.',
      },
    },
  },
};

export const InCard: Story = {
  render: (args) => (
    <Card className="w-full max-w-3xl">
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground ">
          Accordions tuck away dense details while keeping the label visible.
          Use them to group related info inside surfaces.
        </p>
        {renderAccordion(args)}
      </CardContent>
    </Card>
  ),
  parameters: {
    layout: 'padded',
  },
};
