import { z } from 'zod';
import { ComponentKindSchema } from './component-kind.schema';

/**
 * Represents a single component instance on a page.
 */
export const BlockSchemaSchema = z.object({
  id: z.string(),
  kind: ComponentKindSchema,
  title: z.string().optional(),
  dataSourceId: z.string().optional(),
  props: z.record(z.unknown()).optional(),
});

export type BlockSchema = z.infer<typeof BlockSchemaSchema>;
