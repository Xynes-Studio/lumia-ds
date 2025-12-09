import { describe, it, expect } from 'vitest';
import {
  blockRegistry,
  getBlockDefinition,
  getBlockDefinitions,
  getInsertableBlocks,
  getSlashCommandBlocks,
  CORE_BLOCKS,
} from './registry';
import { BlockDefinition, BlockType } from './types';
import { ElementNode } from 'lexical';
import { Type } from 'lucide-react';

describe('Block Registry', () => {
  it('should retrieve core blocks', () => {
    const paragraph = getBlockDefinition('paragraph');
    expect(paragraph).toBeDefined();
    expect(paragraph?.label).toBe('Paragraph');
    expect(paragraph?.type).toBe('paragraph');
  });

  it('should have all core blocks registered', () => {
    const expectedTypes = [
      'paragraph',
      'heading',
      'code',
      'image',
      'video',
      'file',
      'table',
      'panel',
      'status',
    ];
    expectedTypes.forEach((type) => {
      expect(blockRegistry.has(type as BlockType)).toBe(true);
    });
  });

  it('should allow adding a fake block definition to the registry', () => {
    // Simulating adding a new block type that might not be in the union yet (or just testing map functionality)
    const customType = 'custom-test-block' as BlockType;
    const customBlock: BlockDefinition = {
      type: customType,
      label: 'Custom Block',
      icon: Type,
      nodeClass: ElementNode,
    };

    blockRegistry.set(customType, customBlock);

    const retrieved = getBlockDefinition(customType);
    expect(retrieved).toBeDefined();
    expect(retrieved?.label).toBe('Custom Block');
    expect(retrieved?.nodeClass).toBe(ElementNode);
  });

  describe('getBlockDefinitions', () => {
    it('should return all registered block definitions', () => {
      const definitions = getBlockDefinitions();

      // Should have at least the 9 core block types
      expect(definitions.length).toBeGreaterThanOrEqual(9);
    });

    it('should return at least one entry per known block type', () => {
      const definitions = getBlockDefinitions();
      const types = definitions.map((d) => d.type);

      // All 9 core types should be present
      expect(types).toContain('paragraph');
      expect(types).toContain('heading');
      expect(types).toContain('code');
      expect(types).toContain('image');
      expect(types).toContain('video');
      expect(types).toContain('file');
      expect(types).toContain('table');
      expect(types).toContain('panel');
      expect(types).toContain('status');
    });

    it('should return definitions with required fields', () => {
      const definitions = getBlockDefinitions();

      definitions.forEach((def) => {
        expect(def.type).toBeDefined();
        expect(def.label).toBeDefined();
        expect(def.icon).toBeDefined();
        expect(def.nodeClass).toBeDefined();
      });
    });

    it('should return definitions with description and keywords for metadata', () => {
      const definitions = getBlockDefinitions();

      // All core blocks should have description and keywords for slash menu
      const coreTypes: BlockType[] = [
        'paragraph',
        'heading',
        'code',
        'image',
        'video',
        'file',
        'table',
        'panel',
        'status',
      ];

      coreTypes.forEach((type) => {
        const def = definitions.find((d) => d.type === type);
        expect(def).toBeDefined();
        expect(def?.description).toBeDefined();
        expect(def?.keywords).toBeDefined();
        expect(Array.isArray(def?.keywords)).toBe(true);
      });
    });

    it('should return an array (not a Map)', () => {
      const definitions = getBlockDefinitions();
      expect(Array.isArray(definitions)).toBe(true);
    });
  });

  describe('getInsertableBlocks', () => {
    it('should return only blocks with insertable: true', () => {
      const insertable = getInsertableBlocks();
      expect(insertable.length).toBeGreaterThan(0);
      insertable.forEach((block) => {
        expect(block.insertable).toBe(true);
      });
    });

    it('should include image, video, file, table, panel, status', () => {
      const insertable = getInsertableBlocks();
      const types = insertable.map((b) => b.type);
      expect(types).toContain('image');
      expect(types).toContain('video');
      expect(types).toContain('file');
      expect(types).toContain('table');
      expect(types).toContain('panel');
      expect(types).toContain('status');
    });

    it('should exclude non-insertable blocks like paragraph and heading', () => {
      const insertable = getInsertableBlocks();
      const types = insertable.map((b) => b.type);
      expect(types).not.toContain('paragraph');
      expect(types).not.toContain('heading');
      expect(types).not.toContain('code');
    });

    it('should have insertAction defined for all insertable blocks', () => {
      const insertable = getInsertableBlocks();
      insertable.forEach((block) => {
        expect(block.insertAction).toBeDefined();
        expect(['command', 'custom']).toContain(block.insertAction);
      });
    });
  });

  describe('getSlashCommandBlocks', () => {
    it('should return only blocks with slashEnabled: true', () => {
      const slashBlocks = getSlashCommandBlocks();
      expect(slashBlocks.length).toBeGreaterThan(0);
      slashBlocks.forEach((block) => {
        expect(block.slashEnabled).toBe(true);
      });
    });

    it('should include all slash-enabled blocks', () => {
      const slashBlocks = getSlashCommandBlocks();
      const types = slashBlocks.map((b) => b.type);
      expect(types).toContain('image');
      expect(types).toContain('video');
      expect(types).toContain('file');
      expect(types).toContain('table');
      expect(types).toContain('panel');
      expect(types).toContain('status');
    });

    it('should exclude non-slash blocks', () => {
      const slashBlocks = getSlashCommandBlocks();
      const types = slashBlocks.map((b) => b.type);
      expect(types).not.toContain('paragraph');
      expect(types).not.toContain('heading');
      expect(types).not.toContain('code');
    });
  });

  describe('CORE_BLOCKS', () => {
    it('should export CORE_BLOCKS object', () => {
      expect(CORE_BLOCKS).toBeDefined();
      expect(typeof CORE_BLOCKS).toBe('object');
    });

    it('should have 9 core block types', () => {
      expect(Object.keys(CORE_BLOCKS).length).toBe(9);
    });

    it('each core block has type matching its key', () => {
      Object.entries(CORE_BLOCKS).forEach(([key, block]) => {
        expect(block.type).toBe(key);
      });
    });

    it('image block has custom insert action', () => {
      expect(CORE_BLOCKS.image.insertAction).toBe('custom');
    });

    it('table block has command insert action', () => {
      expect(CORE_BLOCKS.table.insertAction).toBe('command');
    });

    it('panel block has inspector', () => {
      expect(CORE_BLOCKS.panel.inspector).toBeDefined();
    });

    it('status block has inspector', () => {
      expect(CORE_BLOCKS.status.inspector).toBeDefined();
    });

    it('video block has inspector', () => {
      expect(CORE_BLOCKS.video.inspector).toBeDefined();
    });

    it('image block has inspector', () => {
      expect(CORE_BLOCKS.image.inspector).toBeDefined();
    });
  });
});
