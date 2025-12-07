import { describe, it, expect } from 'vitest';
import {
  blockRegistry,
  getBlockDefinition,
  getBlockDefinitions,
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
});
