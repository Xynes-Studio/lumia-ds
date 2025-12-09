import { z } from 'zod';

/**
 * UI primitives the runtime renderer understands.
 */
export const ComponentKindSchema = z.enum([
  'table',
  'detail',
  'form',
  'card-list',
  'stat',
]);

export type ComponentKind = z.infer<typeof ComponentKindSchema>;
