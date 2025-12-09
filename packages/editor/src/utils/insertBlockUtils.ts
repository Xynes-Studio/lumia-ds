/**
 * Pure utility functions for InsertBlockMenu.
 * Extracted from InsertBlockMenu.tsx for testability.
 */

import type { BlockDefinition, BlockType } from '../blocks/types';

/**
 * Filter blocks by insert action type.
 * @param blocks - Array of block definitions
 * @param actionType - The insert action type to filter by
 * @returns Filtered blocks with matching action type
 */
export function filterBlocksByInsertAction(
  blocks: BlockDefinition[],
  actionType: 'command' | 'custom',
): BlockDefinition[] {
  return blocks.filter((block) => block.insertAction === actionType);
}

/**
 * Check if a block requires custom input (popover/dialog).
 * @param block - The block definition
 * @returns True if block has custom insert action
 */
export function requiresCustomInput(block: BlockDefinition): boolean {
  return block.insertAction === 'custom';
}

/**
 * Get blocks that are insertable.
 * @param blocks - Array of block definitions
 * @returns Filtered blocks with insertable flag
 */
export function getInsertableFromBlocks(
  blocks: BlockDefinition[],
): BlockDefinition[] {
  return blocks.filter((block) => block.insertable === true);
}

/**
 * Group blocks by their category/type for menu organization.
 * @param blocks - Array of block definitions
 * @returns Object with block type as key and blocks as value
 */
export function groupBlocksByType(
  blocks: BlockDefinition[],
): Record<string, BlockDefinition[]> {
  const groups: Record<string, BlockDefinition[]> = {};
  for (const block of blocks) {
    const category = getBlockCategory(block.type);
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(block);
  }
  return groups;
}

/**
 * Get category for a block type.
 * @param type - The block type
 * @returns Category string
 */
export function getBlockCategory(type: BlockType): string {
  const mediaTypes: BlockType[] = ['image', 'video', 'file'];
  const structureTypes: BlockType[] = ['table', 'panel'];
  const inlineTypes: BlockType[] = ['status'];

  if (mediaTypes.includes(type)) return 'media';
  if (structureTypes.includes(type)) return 'structure';
  if (inlineTypes.includes(type)) return 'inline';
  return 'basic';
}

/**
 * Check if a block type is a media block.
 * @param type - The block type
 * @returns True if block is a media type
 */
export function isMediaBlock(type: BlockType): boolean {
  return getBlockCategory(type) === 'media';
}

/**
 * Sort blocks by label alphabetically.
 * @param blocks - Array of block definitions
 * @returns Sorted blocks
 */
export function sortBlocksByLabel(
  blocks: BlockDefinition[],
): BlockDefinition[] {
  return [...blocks].sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Find a block definition by type.
 * @param blocks - Array of block definitions
 * @param type - The block type to find
 * @returns The matching block or undefined
 */
export function findBlockByType(
  blocks: BlockDefinition[],
  type: BlockType,
): BlockDefinition | undefined {
  return blocks.find((block) => block.type === type);
}
