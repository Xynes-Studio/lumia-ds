/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { ResourcePageRenderer } from './resource-page-renderer';
import type { DataFetcher, PageSchema, ResourceConfig } from './index';

const resource: ResourceConfig = {
  id: 'projects',
  pages: { list: 'projects-list' },
};

const page: PageSchema = {
  id: 'projects-list',
  layout: 'admin-shell',
  grid: {
    columns: 2,
    gap: 16,
    placements: [
      { blockId: 'spotlight', column: 1, row: 1 },
      { blockId: 'summary', column: 2, row: 1 },
      { blockId: 'table', column: 1, row: 2, columnSpan: 2 },
    ],
  },
  blocks: [
    {
      id: 'spotlight',
      kind: 'detail',
      dataSourceId: 'spotlight',
      props: {
        title: 'Spotlight project',
        columns: 1,
        fields: [
          { key: 'name', label: 'Name' },
          { key: 'owner', label: 'Owner' },
          { key: 'status', label: 'Status' },
          {
            key: 'budget',
            label: 'Budget',
            render: ({ value }) => `$${value}k`,
          },
        ],
      },
    },
    {
      id: 'summary',
      kind: 'detail',
      dataSourceId: 'summary',
      props: {
        title: 'Health',
        description: 'Data and permissions fetched at runtime.',
        columns: 1,
        fields: [
          { key: 'active', label: 'Active projects' },
          { key: 'blocked', label: 'Blocked' },
          {
            key: 'lastSync',
            label: 'Last sync',
            render: ({ value }) => new Date(value as number).toLocaleString(),
          },
        ],
      },
    },
    {
      id: 'table',
      kind: 'table',
      dataSourceId: 'projects',
      props: {
        title: 'Projects',
        description: 'Rendered through ResourcePageRenderer with fake fetcher.',
        columns: [
          { key: 'name', label: 'Name', field: 'name' },
          { key: 'owner', label: 'Owner', field: 'owner' },
          { key: 'status', label: 'Status', field: 'status' },
          {
            key: 'updatedAt',
            label: 'Updated',
            render: ({ value }) =>
              new Intl.DateTimeFormat(undefined, {
                month: 'short',
                day: 'numeric',
              }).format(new Date(value as number)),
          },
        ],
      },
    },
  ],
};

const projects = [
  {
    id: 'proj-1',
    name: 'Atlas',
    owner: 'Nova Systems',
    status: 'Active',
    updatedAt: Date.now() - 1000 * 60 * 60 * 12,
  },
  {
    id: 'proj-2',
    name: 'Aurora',
    owner: 'Bright Labs',
    status: 'On track',
    updatedAt: Date.now() - 1000 * 60 * 60 * 36,
  },
  {
    id: 'proj-3',
    name: 'Zephyr',
    owner: 'Northwind',
    status: 'Blocked',
    updatedAt: Date.now() - 1000 * 60 * 60 * 54,
  },
];

const demoFetcher: DataFetcher = {
  async getResourceConfig(resourceName) {
    return resourceName === resource.id ? resource : undefined;
  },
  async getPageSchema(pageId) {
    return pageId === page.id ? page : undefined;
  },
  async getDataSource(dataSourceId) {
    if (dataSourceId === 'projects') {
      return { records: projects };
    }

    if (dataSourceId === 'spotlight') {
      return {
        record: {
          name: 'Atlas',
          owner: 'Nova Systems',
          status: 'Active',
          budget: 280,
        },
      };
    }

    if (dataSourceId === 'summary') {
      return {
        record: {
          active: 5,
          blocked: 1,
          lastSync: Date.now() - 1000 * 60 * 45,
        },
      };
    }

    return undefined;
  },
};

const meta = {
  title: 'Runtime/ResourcePageRenderer',
  component: ResourcePageRenderer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ResourcePageRenderer>;

export default meta;
type Story = StoryObj<typeof ResourcePageRenderer>;

export const ListScreenWithFakeFetcher: Story = {
  render: () => (
    <ResourcePageRenderer
      resourceName="projects"
      screen="list"
      fetcher={demoFetcher}
    />
  ),
};
