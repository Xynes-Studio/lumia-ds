import { ParagraphNode } from 'lexical';
import { HeadingNode } from '@lexical/rich-text';
import { CodeNode } from '@lexical/code';
import { TableNode } from '@lexical/table';
import { ImageBlockNode } from '../nodes/ImageBlockNode';
import { FileBlockNode } from '../nodes/FileBlockNode/FileBlockNode';
import { VideoBlockNode } from '../nodes/VideoBlockNode';
import { PanelBlockNode } from '../nodes/PanelBlockNode/PanelBlockNode';
import { StatusNode } from '../nodes/StatusNode';
import {
  Type,
  Heading,
  Code,
  Image,
  Video,
  File,
  Table,
  LayoutTemplate,
  CircleDot,
} from 'lucide-react';
import { BlockDefinition, BlockType } from './types';

/**
 * Core block definitions for the editor.
 * This is the single source of truth for all block metadata.
 */
export const CORE_BLOCKS: Record<string, BlockDefinition> = {
  paragraph: {
    type: 'paragraph',
    label: 'Paragraph',
    icon: Type,
    nodeClass: ParagraphNode,
    description: 'Plain text paragraph',
    keywords: ['text', 'paragraph', 'plain'],
  },
  heading: {
    type: 'heading',
    label: 'Heading',
    icon: Heading,
    nodeClass: HeadingNode,
    description: 'Section heading',
    keywords: ['heading', 'title', 'h1', 'h2', 'h3', 'header'],
  },
  code: {
    type: 'code',
    label: 'Code Block',
    icon: Code,
    nodeClass: CodeNode,
    description: 'Code block with syntax highlighting',
    keywords: ['code', 'snippet', 'programming', 'syntax'],
  },
  image: {
    type: 'image',
    label: 'Image',
    icon: Image,
    nodeClass: ImageBlockNode,
    description: 'Insert an image from URL',
    keywords: ['image', 'picture', 'photo', 'media'],
    insertable: true,
    insertAction: 'custom',
    slashEnabled: true,
  },
  video: {
    type: 'video',
    label: 'Video',
    icon: Video,
    nodeClass: VideoBlockNode,
    description: 'Embed a video from YouTube, Vimeo, or Loom',
    keywords: ['video', 'youtube', 'vimeo', 'loom', 'embed', 'media'],
    insertable: true,
    insertAction: 'custom',
    slashEnabled: true,
  },
  file: {
    type: 'file',
    label: 'File',
    icon: File,
    nodeClass: FileBlockNode,
    description: 'Attach a file',
    keywords: ['file', 'attachment', 'document', 'upload'],
    insertable: true,
    insertAction: 'custom',
    slashEnabled: true,
  },
  table: {
    type: 'table',
    label: 'Table',
    icon: Table,
    nodeClass: TableNode,
    description: 'Insert a table',
    keywords: ['table', 'grid', 'rows', 'columns'],
    insertable: true,
    insertAction: 'command',
    slashEnabled: true,
  },
  panel: {
    type: 'panel',
    label: 'Panel',
    icon: LayoutTemplate,
    nodeClass: PanelBlockNode,
    description: 'Insert an info panel',
    keywords: ['panel', 'alert', 'info', 'note', 'warning', 'callout'],
    insertable: true,
    insertAction: 'custom',
    slashEnabled: true,
  },
  status: {
    type: 'status',
    label: 'Status',
    icon: CircleDot,
    nodeClass: StatusNode,
    description: 'Insert a status pill',
    keywords: ['status', 'pill', 'tag', 'label', 'badge'],
    insertable: true,
    insertAction: 'command',
    slashEnabled: true,
  },
};

/**
 * Map of all registered block definitions.
 * Use getBlockDefinition() or getBlockDefinitions() for access.
 */
export const blockRegistry = new Map<BlockType, BlockDefinition>(
  Object.values(CORE_BLOCKS).map((block) => [block.type, block]),
);

/**
 * Get a single block definition by type.
 * @param type - The block type to retrieve
 * @returns The block definition or undefined if not found
 */
export function getBlockDefinition(
  type: BlockType,
): BlockDefinition | undefined {
  return blockRegistry.get(type);
}

/**
 * Get all registered block definitions.
 * @returns Array of all block definitions
 */
export function getBlockDefinitions(): BlockDefinition[] {
  return Array.from(blockRegistry.values());
}

/**
 * Get all block definitions that can be inserted via the Insert menu.
 * @returns Array of insertable block definitions
 */
export function getInsertableBlocks(): BlockDefinition[] {
  return getBlockDefinitions().filter((block) => block.insertable === true);
}

/**
 * Get all block definitions that appear in the slash menu.
 * @returns Array of slash-menu-enabled block definitions
 */
export function getSlashCommandBlocks(): BlockDefinition[] {
  return getBlockDefinitions().filter((block) => block.slashEnabled === true);
}
