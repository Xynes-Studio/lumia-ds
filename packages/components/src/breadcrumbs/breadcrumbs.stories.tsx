/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import type { IconId } from '@lumia-ui/icons';
import { Breadcrumbs, type BreadcrumbItem } from './breadcrumbs';

const homeIcon = 'home' as IconId;

const baseItems: BreadcrumbItem[] = [
  { label: 'Home', href: '#', icon: homeIcon },
  { label: 'Catalog', href: '#catalog' },
  { label: 'Footwear', href: '#footwear' },
  { label: 'Running Shoes' },
];

const deepItems: BreadcrumbItem[] = [
  { label: 'Home', href: '#', icon: homeIcon },
  { label: 'Platform', href: '#platform' },
  { label: 'Teams', href: '#teams' },
  { label: 'Design' },
  { label: 'Components' },
  { label: 'Breadcrumbs' },
];

const meta = {
  title: 'Components/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs'],
  args: {
    items: baseItems,
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

export const Default: Story = {};

export const Collapsed: Story = {
  args: {
    items: deepItems,
    maxItems: 3,
  },
};

export const WithClickableItems: Story = {
  args: {
    items: [
      { label: 'Home', href: '#', icon: homeIcon },
      {
        label: 'Projects',
        onClick: () => {
          /* noop for docs */
        },
      },
      { label: 'Alpha' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Breadcrumb items support links or click handlers. The current page item is marked with aria-current="page".',
      },
    },
  },
};
