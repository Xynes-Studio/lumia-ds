/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Pagination } from './pagination';

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  args: {
    page: 1,
    pageSize: 10,
    total: 125,
    pageSizeOptions: [10, 20, 50],
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof Pagination>;

const ControlledPagination = (
  args: Story['args'],
  includePageSizeChange: boolean,
) => {
  const [page, setPage] = useState(args?.page ?? 1);
  const [pageSize, setPageSize] = useState(args?.pageSize ?? 10);

  return (
    <div className="w-full max-w-3xl">
      <Pagination
        {...args}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={
          includePageSizeChange
            ? (size) => {
                setPageSize(size);
                setPage(1);
              }
            : undefined
        }
      />
    </div>
  );
};

export const Playground: Story = {
  render: (args) => ControlledPagination(args, true),
};

export const WithoutPageSize: Story = {
  args: {
    total: 32,
    page: 1,
    pageSize: 8,
  },
  render: (args) => ControlledPagination(args, false),
  parameters: {
    docs: {
      description: {
        story:
          'Use when the consumer controls item counts but page size switching is not required.',
      },
    },
  },
};
