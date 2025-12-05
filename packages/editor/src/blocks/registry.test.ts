import { describe, it, expect } from 'vitest';
import { blockRegistry, getBlockDefinition } from './registry';
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
});
