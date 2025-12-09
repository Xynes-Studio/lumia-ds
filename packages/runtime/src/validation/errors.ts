/**
 * Error types for config validation failures.
 * These provide structured error information when Zod schema validation fails.
 */

/**
 * Represents a single validation issue from Zod.
 */
export type ConfigValidationIssue = {
  /** Path to the invalid field (e.g., ['blocks', 0, 'kind']) */
  path: (string | number)[];
  /** Human-readable error message */
  message: string;
  /** Zod error code (e.g., 'invalid_type', 'invalid_enum_value') */
  code: string;
};

/**
 * Error object for invalid page configurations.
 */
export type PageConfigError = {
  type: 'page-config-error';
  pageId: string;
  issues: ConfigValidationIssue[];
};

/**
 * Error object for invalid resource configurations.
 */
export type ResourceConfigError = {
  type: 'resource-config-error';
  resourceName: string;
  issues: ConfigValidationIssue[];
};

/**
 * Error object for invalid data source results.
 */
export type DataSourceError = {
  type: 'data-source-error';
  dataSourceId: string;
  issues: ConfigValidationIssue[];
};

/**
 * Union type of all config validation errors.
 */
export type ConfigError =
  | PageConfigError
  | ResourceConfigError
  | DataSourceError;

/**
 * Formats validation issues into a human-readable string for dev logs.
 */
export function formatValidationError(error: ConfigError): string {
  const header = (() => {
    switch (error.type) {
      case 'page-config-error':
        return `Page config validation failed for "${error.pageId}"`;
      case 'resource-config-error':
        return `Resource config validation failed for "${error.resourceName}"`;
      case 'data-source-error':
        return `Data source validation failed for "${error.dataSourceId}"`;
    }
  })();

  const issueLines = error.issues.map(
    (issue) => `  - ${issue.path.join('.')}: ${issue.message} (${issue.code})`,
  );

  return [header, ...issueLines].join('\n');
}
