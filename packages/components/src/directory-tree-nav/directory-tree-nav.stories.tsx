/* istanbul ignore file */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DirectoryTreeNav, type DirectoryTreeNode } from './directory-tree-nav';
import { insertDirectoryNode } from './directory-tree-nav.utils';

const baseNodes: DirectoryTreeNode[] = [
  {
    id: 'blogs',
    label: 'Blogs',
    children: [
      { id: 'news', label: 'News' },
      { id: 'guides', label: 'Guides' },
    ],
  },
  {
    id: 'docs',
    label: 'Docs',
    children: [{ id: 'api', label: 'API' }],
  },
];

const meta = {
  title: 'Components/DirectoryTreeNav',
  component: DirectoryTreeNav,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof DirectoryTreeNav>;

export default meta;
type Story = StoryObj<typeof DirectoryTreeNav>;

export const Default: Story = {
  render: () => {
    const [expandedIds, setExpandedIds] = useState<string[]>(['blogs']);
    const [nodes, setNodes] = useState<DirectoryTreeNode[]>(baseNodes);

    return (
      <div className="w-80 rounded-lg border border-border bg-background p-2">
        <DirectoryTreeNav
          rootLabel="Contents"
          rootHref="/dashboard/acme"
          rootActive
          nodes={nodes}
          expandedIds={expandedIds}
          onExpandedIdsChange={setExpandedIds}
          onCreateDirectory={({ parentId, name }) => {
            setNodes((previous) =>
              insertDirectoryNode({
                nodes: previous,
                parentId,
                newNode: {
                  id: `${Date.now()}`,
                  label: name,
                  children: [],
                },
              }),
            );
          }}
        />
      </div>
    );
  },
};
