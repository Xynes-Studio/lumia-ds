import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  validatePageConfig,
  validateResourceConfig,
  validateDataSourceResult,
} from '../validators';
import { formatValidationError } from '../errors';
import {
  // Invalid fixtures
  invalidPageMissingId,
  invalidPageBadLayout,
  invalidPageMissingBlockKind,
  invalidPageBadBlockKind,
  invalidResourceMissingId,
  invalidDataSourceBadRecordsType,
  invalidNotAnObject,
  invalidNullValue,
  // Valid fixtures
  validPageConfig,
  validResourceConfig,
  validDataSourceResult,
} from './invalid-fixtures';

describe('validatePageConfig', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('returns success with data for valid page config', () => {
    const result = validatePageConfig(validPageConfig, 'test-page');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('test-page');
      expect(result.data.layout).toBe('admin-shell');
      expect(result.data.blocks).toHaveLength(2);
    }
  });

  it('returns error with path ["id"] when id is missing', () => {
    const result = validatePageConfig(invalidPageMissingId, 'test-page');

    expect(result.success).toBe(false);
    if (!result.success && result.error.type === 'page-config-error') {
      expect(result.error.pageId).toBe('test-page');
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({
          path: ['id'],
          code: 'invalid_type',
        }),
      );
    }
  });

  it('returns error with path ["layout"] for invalid layout value', () => {
    const result = validatePageConfig(invalidPageBadLayout, 'test-page');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({
          path: ['layout'],
          code: 'invalid_enum_value',
        }),
      );
    }
  });

  it('returns error with path ["blocks", 0, "kind"] when block kind is missing', () => {
    const result = validatePageConfig(invalidPageMissingBlockKind, 'test-page');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({
          path: ['blocks', 0, 'kind'],
          code: 'invalid_type',
        }),
      );
    }
  });

  it('returns error with path ["blocks", 0, "kind"] for invalid block kind value', () => {
    const result = validatePageConfig(invalidPageBadBlockKind, 'test-page');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({
          path: ['blocks', 0, 'kind'],
          code: 'invalid_enum_value',
        }),
      );
    }
  });

  it('handles non-object input gracefully', () => {
    const result = validatePageConfig(invalidNotAnObject, 'test-page');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('page-config-error');
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });

  it('handles null input gracefully', () => {
    const result = validatePageConfig(invalidNullValue, 'test-page');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('page-config-error');
    }
  });

  it('logs warning in development mode on validation failure', () => {
    /* eslint-disable no-undef */
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    validatePageConfig(invalidPageMissingId, 'test-page');

    expect(consoleWarnSpy).toHaveBeenCalled();
    process.env.NODE_ENV = originalEnv;
    /* eslint-enable no-undef */
  });
});

describe('validateResourceConfig', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('returns success with data for valid resource config', () => {
    const result = validateResourceConfig(validResourceConfig, 'users');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('users');
      expect(result.data.pages?.list).toBe('users-list');
    }
  });

  it('returns error with path ["id"] when id is missing', () => {
    const result = validateResourceConfig(invalidResourceMissingId, 'users');

    expect(result.success).toBe(false);
    if (!result.success && result.error.type === 'resource-config-error') {
      expect(result.error.resourceName).toBe('users');
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({
          path: ['id'],
          code: 'invalid_type',
        }),
      );
    }
  });

  it('handles non-object input gracefully', () => {
    const result = validateResourceConfig(invalidNotAnObject, 'users');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('resource-config-error');
    }
  });
});

describe('validateDataSourceResult', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('returns success with data for valid data source result', () => {
    const result = validateDataSourceResult(validDataSourceResult, 'users');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.records).toHaveLength(1);
      expect(result.data.record?.name).toBe('Test Record');
    }
  });

  it('returns error with path ["records"] for invalid records type', () => {
    const result = validateDataSourceResult(
      invalidDataSourceBadRecordsType,
      'users',
    );

    expect(result.success).toBe(false);
    if (!result.success && result.error.type === 'data-source-error') {
      expect(result.error.dataSourceId).toBe('users');
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({
          path: ['records'],
          code: 'invalid_type',
        }),
      );
    }
  });

  it('returns success for empty object (all fields optional)', () => {
    const result = validateDataSourceResult({}, 'empty-source');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({});
    }
  });
});

describe('formatValidationError', () => {
  it('formats page config error with readable output', () => {
    const error = {
      type: 'page-config-error' as const,
      pageId: 'test-page',
      issues: [
        { path: ['id'], message: 'Required', code: 'invalid_type' },
        {
          path: ['layout'],
          message: 'Invalid enum value',
          code: 'invalid_enum_value',
        },
      ],
    };

    const formatted = formatValidationError(error);

    expect(formatted).toContain(
      'Page config validation failed for "test-page"',
    );
    expect(formatted).toContain('id: Required (invalid_type)');
    expect(formatted).toContain(
      'layout: Invalid enum value (invalid_enum_value)',
    );
  });

  it('formats resource config error', () => {
    const error = {
      type: 'resource-config-error' as const,
      resourceName: 'users',
      issues: [{ path: ['id'], message: 'Required', code: 'invalid_type' }],
    };

    const formatted = formatValidationError(error);

    expect(formatted).toContain(
      'Resource config validation failed for "users"',
    );
  });

  it('formats data source error', () => {
    const error = {
      type: 'data-source-error' as const,
      dataSourceId: 'user-list',
      issues: [
        { path: ['records'], message: 'Expected array', code: 'invalid_type' },
      ],
    };

    const formatted = formatValidationError(error);

    expect(formatted).toContain(
      'Data source validation failed for "user-list"',
    );
    expect(formatted).toContain('records: Expected array (invalid_type)');
  });

  it('formats nested path correctly', () => {
    const error = {
      type: 'page-config-error' as const,
      pageId: 'test-page',
      issues: [
        {
          path: ['blocks', 0, 'kind'],
          message: 'Invalid value',
          code: 'invalid_enum_value',
        },
      ],
    };

    const formatted = formatValidationError(error);

    expect(formatted).toContain(
      'blocks.0.kind: Invalid value (invalid_enum_value)',
    );
  });
});
