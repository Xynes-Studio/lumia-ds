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
}
