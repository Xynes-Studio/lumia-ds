import { z } from 'zod';
import { BlockSchemaSchema } from './block.schema';
import { PageGridSchema } from './grid.schema';

/**
 * Describes a single renderable page/screen.
 */
export const PageSchemaSchema = z.object({
  id: z.string(),
  layout: z.enum(['admin-shell', 'stack', 'drawer']),
  blocks: z.array(BlockSchemaSchema),
  grid: PageGridSchema.optional(),
});

export type PageSchema = z.infer<typeof PageSchemaSchema>;
