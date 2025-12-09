import { z } from 'zod';
import { BlockSchemaSchema } from './block.schema';
import { PageGridSchema } from './grid.schema';

/**
 * Describes a single renderable page/screen.
 *
 * Note: The blocks array uses z.unknown() to allow lenient page-level validation.
 * Individual blocks are validated at render time, enabling graceful degradation
 * where invalid blocks show BlockErrorWidget while valid blocks render normally.
 */
export const PageSchemaSchema = z.object({
  id: z.string(),
  layout: z.enum(['admin-shell', 'stack', 'drawer']),
  // Lenient: individual blocks validated at render time with validateBlock()
  blocks: z.array(z.unknown()),
  grid: PageGridSchema.optional(),
});

export type PageSchema = z.infer<typeof PageSchemaSchema>;

/**
 * Strict page schema for scenarios requiring full block validation upfront.
 * Use this when you want to fail fast on invalid block configurations.
 */
export const PageSchemaSchemaStrict = z.object({
  id: z.string(),
  layout: z.enum(['admin-shell', 'stack', 'drawer']),
  blocks: z.array(BlockSchemaSchema),
  grid: PageGridSchema.optional(),
});

export type PageSchemaStrict = z.infer<typeof PageSchemaSchemaStrict>;
