/**
 * Validation wrapper functions using Zod safeParse.
 * These wrap config fetches to provide structured errors instead of exceptions.
 */
import type { ZodIssue } from 'zod';
import {
  PageSchemaSchema,
  ResourceConfigSchema,
  DataSourceResultSchema,
  type PageSchema,
  type ResourceConfigInferred,
  type DataSourceResultInferred,
} from '../schemas';
import type {
  ConfigValidationIssue,
  PageConfigError,
  ResourceConfigError,
  DataSourceError,
} from './errors';
import { formatValidationError } from './errors';

/**
 * Result of a validation operation.
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: PageConfigError | ResourceConfigError | DataSourceError;
    };

/**
 * Maps Zod issues to our ConfigValidationIssue format.
 */
function mapZodIssues(issues: ZodIssue[]): ConfigValidationIssue[] {
  return issues.map((issue) => ({
    path: issue.path,
    message: issue.message,
    code: issue.code,
  }));
}

/**
 * Logs validation errors in development mode.
 */
function logValidationError(
  error: PageConfigError | ResourceConfigError | DataSourceError,
): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((globalThis as any).process?.env?.NODE_ENV === 'development') {
    console.warn(formatValidationError(error));
  }
}

/**
 * Validates a page configuration against the PageSchemaSchema.
 * @param json - The raw JSON to validate
 * @param pageId - The page identifier for error context
 * @returns Validation result with typed data or structured error
 */
export function validatePageConfig(
  json: unknown,
  pageId: string,
): ValidationResult<PageSchema> {
  const result = PageSchemaSchema.safeParse(json);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const error: PageConfigError = {
    type: 'page-config-error',
    pageId,
    issues: mapZodIssues(result.error.issues),
  };

  logValidationError(error);
  return { success: false, error };
}

/**
 * Validates a resource configuration against the ResourceConfigSchema.
 * @param json - The raw JSON to validate
 * @param resourceName - The resource name for error context
 * @returns Validation result with typed data or structured error
 */
export function validateResourceConfig(
  json: unknown,
  resourceName: string,
): ValidationResult<ResourceConfigInferred> {
  const result = ResourceConfigSchema.safeParse(json);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const error: ResourceConfigError = {
    type: 'resource-config-error',
    resourceName,
    issues: mapZodIssues(result.error.issues),
  };

  logValidationError(error);
  return { success: false, error };
}

/**
 * Validates a data source result against the DataSourceResultSchema.
 * @param json - The raw JSON to validate
 * @param dataSourceId - The data source identifier for error context
 * @returns Validation result with typed data or structured error
 */
export function validateDataSourceResult(
  json: unknown,
  dataSourceId: string,
): ValidationResult<DataSourceResultInferred> {
  const result = DataSourceResultSchema.safeParse(json);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const error: DataSourceError = {
    type: 'data-source-error',
    dataSourceId,
    issues: mapZodIssues(result.error.issues),
  };

  logValidationError(error);
  return { success: false, error };
}
