import { LexicalNode, NodeKey, Klass } from 'lexical';
import React from 'react';

export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'image'
  | 'video'
  | 'file'
  | 'table'
  | 'panel'
  | 'status'
  | 'code';

export interface BlockDefinition {
  type: BlockType;
  label: string;
  icon: React.ComponentType;
  nodeClass: Klass<LexicalNode>;
  inspector?: React.ComponentType<{ nodeKey: NodeKey }>;
  /** Description shown in slash menu */
  description?: string;
  /** Keywords for slash menu filtering */
  keywords?: string[];
  /** Custom slash command name (defaults to type) */
  slashCommand?: string;
  /** Whether this block can be inserted via the Insert menu */
  insertable?: boolean;
  /** Insert action type - 'command' dispatches directly, 'custom' opens dialog/popover */
  insertAction?: 'command' | 'custom';
}
