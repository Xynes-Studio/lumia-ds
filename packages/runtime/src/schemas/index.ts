// Schema exports
export {
  ComponentKindSchema,
  type ComponentKind,
} from './component-kind.schema';

export { BlockSchemaSchema, type BlockSchema } from './block.schema';

export {
  GridPlacementSchema,
  PageGridSchema,
  type GridPlacement,
  type PageGrid,
} from './grid.schema';

export { PageSchemaSchema, type PageSchema } from './page.schema';

export {
  ResourceScreenSchema,
  ResourcePageRefsSchema,
  ResourceConfigSchema,
  type ResourceScreen,
  type ResourcePageRefs,
  type ResourceConfigInferred,
} from './resource.schema';

export {
  DataQueryContextSchema,
  DataSourceResultSchema,
  type DataQueryContextInferred,
  type DataSourceResultInferred,
} from './data.schema';
