/**
 * UI primitives the runtime renderer understands.
 */
export type ComponentKind = 'table' | 'detail' | 'form' | 'card-list' | 'stat';

/**
 * Represents a single component instance on a page.
 */
export type BlockSchema = {
  id: string;
  kind: ComponentKind;
  title?: string;
  dataSourceId?: string;
  props?: Record<string, unknown>;
};

/**
 * Simple placement metadata for arranging blocks in a grid.
 */
export type GridPlacement = {
  blockId: BlockSchema['id'];
  column: number;
  row: number;
  columnSpan?: number;
  rowSpan?: number;
};

/**
 * Lightweight grid definition for page layouts.
 */
export type PageGrid = {
  columns?: number;
  gap?: number;
  placements: GridPlacement[];
};

/**
 * Describes a single renderable page/screen.
 */
export type PageSchema = {
  id: string;
  layout: 'admin-shell' | 'stack' | 'drawer';
  blocks: BlockSchema[];
  grid?: PageGrid;
};

/**
 * References to pages used for a given resource lifecycle.
 */
export type ResourcePageRefs = {
  list?: PageSchema['id'];
  detail?: PageSchema['id'];
  create?: PageSchema['id'];
  edit?: PageSchema['id'];
};

/**
 * Resource configuration that links back to page definitions.
 */
export type ResourceConfig = {
  id: string;
  pages?: ResourcePageRefs;
};

export { DetailBlock, ListBlock } from './blocks';
export type {
  DetailBlockConfig,
  DetailBlockField,
  DetailBlockProps,
  ListBlockColumn,
  ListBlockConfig,
  ListBlockProps,
} from './blocks';
