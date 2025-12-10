import { z } from 'zod';
import { ResourceScreenSchema } from './resource.schema';

/**
 * Context passed to data fetching operations.
 */
export const DataQueryContextSchema = z.object({
  resource: z.unknown(),
  screen: ResourceScreenSchema,
  params: z.record(z.string()).optional(),
  permissions: z.array(z.string()).optional(),
});

export type DataQueryContextInferred = z.infer<typeof DataQueryContextSchema>;

/**
 * Result of a data source fetch operation.
 */
export const DataSourceResultSchema = z.object({
  records: z.array(z.record(z.unknown())).optional(),
  record: z.record(z.unknown()).optional(),
  initialValues: z.record(z.unknown()).optional(),
});

export type DataSourceResultInferred = z.infer<typeof DataSourceResultSchema>;
