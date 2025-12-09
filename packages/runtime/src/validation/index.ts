// Validation module exports
export {
  type ConfigValidationIssue,
  type PageConfigError,
  type ResourceConfigError,
  type DataSourceError,
  type ConfigError,
  formatValidationError,
} from './errors';

export {
  type ValidationResult,
  validatePageConfig,
  validateResourceConfig,
  validateDataSourceResult,
} from './validators';
