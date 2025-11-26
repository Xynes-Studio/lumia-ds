import type { FieldValues } from '@lumia/forms';
import type { FieldConfig, FormDataFetcher } from './blocks';

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
  update?: PageSchema['id'];
};

/**
 * Resource configuration that links back to page definitions.
 */
export type ResourceConfig<TFieldValues extends FieldValues = FieldValues> = {
  id: string;
  pages?: ResourcePageRefs;
  fields?: FieldConfig<TFieldValues>[];
  dataFetcher?: FormDataFetcher<TFieldValues>;
};

export function defineResource<TFieldValues extends FieldValues = FieldValues>(
  config: ResourceConfig<TFieldValues>,
): ResourceConfig<TFieldValues> {
  return config;
}

export type ResourceScreen = 'list' | 'detail' | 'create' | 'update';

export type DataQueryContext<TFieldValues extends FieldValues = FieldValues> = {
  resource: ResourceConfig<TFieldValues>;
  screen: ResourceScreen;
  params?: Record<string, string>;
  permissions?: string[];
};

export type DataSourceResult<TFieldValues extends FieldValues = FieldValues> = {
  records?: Array<Record<string, unknown>>;
  record?: Record<string, unknown>;
  initialValues?: Partial<TFieldValues>;
};

export type DataFetcher<TFieldValues extends FieldValues = FieldValues> = {
  getResourceConfig: (
    resourceName: string,
  ) =>
    | ResourceConfig<TFieldValues>
    | Promise<ResourceConfig<TFieldValues> | undefined>
    | undefined;
  getPageSchema: (
    pageId: string,
  ) => PageSchema | Promise<PageSchema | undefined> | undefined;
  getDataSource?: (
    dataSourceId: string,
    context: DataQueryContext<TFieldValues>,
  ) =>
    | DataSourceResult<TFieldValues>
    | Promise<DataSourceResult<TFieldValues> | undefined>
    | undefined;
  canAccess?: (
    context: DataQueryContext<TFieldValues>,
  ) => boolean | Promise<boolean>;
};

export { DetailBlock, FormBlock, ListBlock } from './blocks';
export type {
  DetailBlockConfig,
  DetailBlockField,
  DetailBlockProps,
  FieldConfig,
  FieldOption,
  FormBlockConfig,
  FormBlockProps,
  FormDataFetcher,
  FormFieldKind,
  ListBlockColumn,
  ListBlockConfig,
  ListBlockProps,
} from './blocks';
export { ResourcePageRenderer } from './resource-page-renderer';
