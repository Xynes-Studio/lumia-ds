import { describe, test, expect } from 'vitest';
import {
  filterBlocksByInsertAction,
  requiresCustomInput,
  getInsertableFromBlocks,
  groupBlocksByType,
  getBlockCategory,
  isMediaBlock,
  sortBlocksByLabel,
  findBlockByType,
} from '../insertBlockUtils';
import type { BlockDefinition } from '../../blocks/types';

// Mock block definitions for testing
const mockBlocks: BlockDefinition[] = [
  {
    type: 'image',
    label: 'Image',
    insertable: true,
    insertAction: 'custom',
    icon: () => null,
    nodeClass: {} as never,
    description: 'Insert an image',
    keywords: ['image', 'picture'],
    slashEnabled: true,
  },
  {
    type: 'table',
    label: 'Table',
    insertable: true,
    insertAction: 'command',
    icon: () => null,
    nodeClass: {} as never,
    description: 'Insert a table',
    keywords: ['table', 'grid'],
    slashEnabled: true,
  },
  {
    type: 'video',
    label: 'Video',
    insertable: true,
    insertAction: 'custom',
    icon: () => null,
    nodeClass: {} as never,
    description: 'Insert a video',
    keywords: ['video', 'media'],
    slashEnabled: true,
  },
  {
    type: 'panel',
    label: 'Panel',
    insertable: true,
    insertAction: 'custom',
    icon: () => null,
    nodeClass: {} as never,
    description: 'Insert a panel',
    keywords: ['panel', 'callout'],
    slashEnabled: true,
  },
  {
    type: 'status',
    label: 'Status',
    insertable: true,
    insertAction: 'command',
    icon: () => null,
    nodeClass: {} as never,
    description: 'Insert a status',
    keywords: ['status', 'badge'],
    slashEnabled: true,
  },
  {
    type: 'file',
    label: 'File',
    insertable: false,
    insertAction: 'custom',
    icon: () => null,
    nodeClass: {} as never,
    description: 'Insert a file',
    keywords: ['file', 'attachment'],
    slashEnabled: false,
  },
];

describe('insertBlockUtils', () => {
  describe('filterBlocksByInsertAction', () => {
    test('should filter blocks with command action', () => {
      const result = filterBlocksByInsertAction(mockBlocks, 'command');
      expect(result.length).toBe(2);
      expect(result.every((b) => b.insertAction === 'command')).toBe(true);
    });

    test('should filter blocks with custom action', () => {
      const result = filterBlocksByInsertAction(mockBlocks, 'custom');
      expect(result.length).toBe(4);
      expect(result.every((b) => b.insertAction === 'custom')).toBe(true);
    });

    test('should return empty array for no matches', () => {
      const emptyBlocks: BlockDefinition[] = [];
      const result = filterBlocksByInsertAction(emptyBlocks, 'command');
      expect(result.length).toBe(0);
    });
  });

  describe('requiresCustomInput', () => {
    test('should return true for custom action block', () => {
      const imageBlock = mockBlocks.find((b) => b.type === 'image')!;
      expect(requiresCustomInput(imageBlock)).toBe(true);
    });

    test('should return false for command action block', () => {
      const tableBlock = mockBlocks.find((b) => b.type === 'table')!;
      expect(requiresCustomInput(tableBlock)).toBe(false);
    });
  });

  describe('getInsertableFromBlocks', () => {
    test('should filter only insertable blocks', () => {
      const result = getInsertableFromBlocks(mockBlocks);
      expect(result.length).toBe(5);
      expect(result.every((b) => b.insertable === true)).toBe(true);
    });

    test('should exclude non-insertable blocks', () => {
      const result = getInsertableFromBlocks(mockBlocks);
      expect(result.find((b) => b.type === 'file')).toBeUndefined();
    });
  });

  describe('groupBlocksByType', () => {
    test('should group blocks by category', () => {
      const result = groupBlocksByType(mockBlocks);
      expect(result.media).toBeDefined();
      expect(result.structure).toBeDefined();
      expect(result.inline).toBeDefined();
    });

    test('should have image and video in media category', () => {
      const result = groupBlocksByType(mockBlocks);
      expect(result.media.map((b) => b.type)).toContain('image');
      expect(result.media.map((b) => b.type)).toContain('video');
      expect(result.media.map((b) => b.type)).toContain('file');
    });

    test('should have table and panel in structure category', () => {
      const result = groupBlocksByType(mockBlocks);
      expect(result.structure.map((b) => b.type)).toContain('table');
      expect(result.structure.map((b) => b.type)).toContain('panel');
    });
  });

  describe('getBlockCategory', () => {
    test('should return media for image type', () => {
      expect(getBlockCategory('image')).toBe('media');
    });

    test('should return media for video type', () => {
      expect(getBlockCategory('video')).toBe('media');
    });

    test('should return structure for table type', () => {
      expect(getBlockCategory('table')).toBe('structure');
    });

    test('should return inline for status type', () => {
      expect(getBlockCategory('status')).toBe('inline');
    });

    test('should return basic for unknown types', () => {
      expect(getBlockCategory('paragraph' as never)).toBe('basic');
    });
  });

  describe('isMediaBlock', () => {
    test('should return true for image', () => {
      expect(isMediaBlock('image')).toBe(true);
    });

    test('should return true for video', () => {
      expect(isMediaBlock('video')).toBe(true);
    });

    test('should return true for file', () => {
      expect(isMediaBlock('file')).toBe(true);
    });

    test('should return false for table', () => {
      expect(isMediaBlock('table')).toBe(false);
    });

    test('should return false for status', () => {
      expect(isMediaBlock('status')).toBe(false);
    });
  });

  describe('sortBlocksByLabel', () => {
    test('should sort blocks alphabetically by label', () => {
      const result = sortBlocksByLabel(mockBlocks);
      const labels = result.map((b) => b.label);
      expect(labels).toEqual([...labels].sort());
    });

    test('should not mutate original array', () => {
      const original = [...mockBlocks];
      sortBlocksByLabel(mockBlocks);
      expect(mockBlocks).toEqual(original);
    });
  });

  describe('findBlockByType', () => {
    test('should find block by type', () => {
      const result = findBlockByType(mockBlocks, 'image');
      expect(result).toBeDefined();
      expect(result?.type).toBe('image');
    });

    test('should return undefined for non-existent type', () => {
      const result = findBlockByType(mockBlocks, 'unknown' as never);
      expect(result).toBeUndefined();
    });
  });
});
