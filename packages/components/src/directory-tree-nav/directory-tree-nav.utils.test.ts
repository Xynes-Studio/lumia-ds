import { describe, expect, it } from 'vitest';
import {
  getSiblingNodes,
  insertDirectoryNode,
  isDirectoryNameUniqueInSiblings,
  normalizeDirectoryName,
  validateDirectoryName,
  type DirectoryTreeNode,
} from './directory-tree-nav.utils';

const fixture: DirectoryTreeNode[] = [
  {
    id: 'n-1',
    label: 'Blogs',
    children: [
      {
        id: 'n-1-1',
        label: 'Guides',
      },
    ],
  },
  {
    id: 'n-2',
    label: 'Landing Pages',
  },
];

describe('directory-tree-nav.utils', () => {
  it('normalizes directory names by trimming surrounding spaces', () => {
    expect(normalizeDirectoryName('  Blogs  ')).toBe('Blogs');
  });

  it('returns siblings for root and nested parents', () => {
    expect(getSiblingNodes(fixture, null)).toHaveLength(2);
    expect(getSiblingNodes(fixture, 'n-1')).toEqual([
      {
        id: 'n-1-1',
        label: 'Guides',
      },
    ]);
  });

  it('enforces sibling-only case-insensitive uniqueness', () => {
    expect(
      isDirectoryNameUniqueInSiblings({
        nodes: fixture,
        parentId: null,
        name: 'blogs',
      }),
    ).toBe(false);

    expect(
      isDirectoryNameUniqueInSiblings({
        nodes: fixture,
        parentId: 'n-1',
        name: 'blogs',
      }),
    ).toBe(true);
  });

  it('inserts root and nested nodes without mutating the input array', () => {
    const rootInserted = insertDirectoryNode({
      nodes: fixture,
      parentId: null,
      newNode: { id: 'n-3', label: 'Docs' },
    });

    expect(rootInserted).toHaveLength(3);
    expect(fixture).toHaveLength(2);

    const nestedInserted = insertDirectoryNode({
      nodes: fixture,
      parentId: 'n-1',
      newNode: { id: 'n-1-2', label: 'Blogs' },
    });

    expect(nestedInserted[0]?.children).toEqual([
      {
        id: 'n-1-1',
        label: 'Guides',
      },
      {
        id: 'n-1-2',
        label: 'Blogs',
      },
    ]);
  });

  it('validates empty, max-length, duplicate, and valid names', () => {
    expect(
      validateDirectoryName({
        nodes: fixture,
        parentId: null,
        rawName: '   ',
        maxNameLength: 80,
      }),
    ).toEqual({
      normalizedName: '',
      error: 'Directory name is required.',
    });

    expect(
      validateDirectoryName({
        nodes: fixture,
        parentId: null,
        rawName: 'a'.repeat(81),
        maxNameLength: 80,
      }),
    ).toEqual({
      normalizedName: 'a'.repeat(81),
      error: 'Directory name must be 80 characters or fewer.',
    });

    expect(
      validateDirectoryName({
        nodes: fixture,
        parentId: null,
        rawName: ' blogs ',
        maxNameLength: 80,
      }),
    ).toEqual({
      normalizedName: 'blogs',
      error: 'A directory with this name already exists in this location.',
    });

    expect(
      validateDirectoryName({
        nodes: fixture,
        parentId: 'n-1',
        rawName: ' blogs ',
        maxNameLength: 80,
      }),
    ).toEqual({
      normalizedName: 'blogs',
      error: null,
    });
  });
});
