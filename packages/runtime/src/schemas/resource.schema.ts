import { z } from 'zod';

/**
 * Resource screen types for lifecycle navigation.
 */
export const ResourceScreenSchema = z.enum([
  'list',
  'detail',
  'create',
  'update',
]);

export type ResourceScreen = z.infer<typeof ResourceScreenSchema>;

/**
 * References to pages used for a given resource lifecycle.
 */
export const ResourcePageRefsSchema = z.object({
  list: z.string().optional(),
  detail: z.string().optional(),
  create: z.string().optional(),
  edit: z.string().optional(),
  update: z.string().optional(),
});

export type ResourcePageRefs = z.infer<typeof ResourcePageRefsSchema>;

/**
 * Resource configuration that links back to page definitions.
 * Note: fields and dataFetcher are generic types that can't be fully
 * validated at runtime in a type-safe manner, so we use passthrough.
 */
export const ResourceConfigSchema = z.object({
  id: z.string(),
  pages: ResourcePageRefsSchema.optional(),
  fields: z.array(z.unknown()).optional(),
  dataFetcher: z.unknown().optional(),
});

export type ResourceConfigInferred = z.infer<typeof ResourceConfigSchema>;
