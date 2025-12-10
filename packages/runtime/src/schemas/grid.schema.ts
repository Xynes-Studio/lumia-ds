import { z } from 'zod';

/**
 * Simple placement metadata for arranging blocks in a grid.
 */
export const GridPlacementSchema = z.object({
  blockId: z.string(),
  column: z.number(),
  row: z.number(),
  columnSpan: z.number().optional(),
  rowSpan: z.number().optional(),
});

export type GridPlacement = z.infer<typeof GridPlacementSchema>;

/**
 * Lightweight grid definition for page layouts.
 */
export const PageGridSchema = z.object({
  columns: z.number().optional(),
  gap: z.number().optional(),
  placements: z.array(GridPlacementSchema),
});

export type PageGrid = z.infer<typeof PageGridSchema>;
