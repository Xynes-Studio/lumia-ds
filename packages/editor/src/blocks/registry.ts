import { ParagraphNode, ElementNode } from 'lexical';
import { HeadingNode } from '@lexical/rich-text';
import { CodeNode } from '@lexical/code';
import { TableNode } from '@lexical/table';
import { ImageBlockNode } from '../nodes/ImageBlockNode';
import { FileBlockNode } from '../nodes/FileBlockNode/FileBlockNode';
import { VideoBlockNode } from '../nodes/VideoBlockNode';
import {
  Type,
  Heading,
  Code,
  Image,
  Video,
  File,
  Table,
  LayoutTemplate,
  Info,
} from 'lucide-react';
import { BlockDefinition, BlockType } from './types';

export const CORE_BLOCKS: Record<string, BlockDefinition> = {
  paragraph: {
    type: 'paragraph',
    label: 'Paragraph',
    icon: Type,
    nodeClass: ParagraphNode,
  },
  heading: {
    type: 'heading',
    label: 'Heading',
    icon: Heading,
    nodeClass: HeadingNode,
  },
  code: {
    type: 'code',
    label: 'Code Block',
    icon: Code,
    nodeClass: CodeNode,
  },
  // Placeholders
  image: {
    type: 'image',
    label: 'Image',
    icon: Image,
    nodeClass: ImageBlockNode,
  },
  video: {
    type: 'video',
    label: 'Video',
    icon: Video,
    nodeClass: VideoBlockNode,
  },
  file: {
    type: 'file',
    label: 'File',
    icon: File,
    nodeClass: FileBlockNode,
  },
  table: {
    type: 'table',
    label: 'Table',
    icon: Table,
    nodeClass: TableNode,
  },
  panel: {
    type: 'panel',
    label: 'Panel',
    icon: LayoutTemplate,
    nodeClass: ElementNode,
  },
  status: {
    type: 'status',
    label: 'Status',
    icon: Info,
    nodeClass: ElementNode,
  },
};

export const blockRegistry = new Map<BlockType, BlockDefinition>(
  Object.values(CORE_BLOCKS).map((block) => [block.type, block]),
);

export function getBlockDefinition(
  type: BlockType,
): BlockDefinition | undefined {
  return blockRegistry.get(type);
}
