/**
 * Block-level validation for individual blocks.
 * Allows graceful degradation when a single block fails validation.
 */
import type { BlockSchema } from '../index';
import { BlockSchemaSchema } from '../schemas';
import type { ConfigValidationIssue } from './errors';

/**
 * Error object for invalid block configurations.
 */
export type BlockConfigError = {
  type: 'block-config-error';
  blockId: string;
  issues: ConfigValidationIssue[];
};

/**
 * Result of block validation.
 */
export type BlockValidationResult =
  | { success: true; data: BlockSchema }
  | { success: false; error: BlockConfigError };

/**
 * Validates an individual block against the BlockSchemaSchema.
 * @param json - The raw block JSON to validate
 * @param blockId - The block identifier for error context (fallback if id missing)
 * @returns Validation result with typed data or structured error
 */
export function validateBlock(
  json: unknown,
  blockId: string,
): BlockValidationResult {
  const result = BlockSchemaSchema.safeParse(json);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const error: BlockConfigError = {
    type: 'block-config-error',
    blockId,
    issues: result.error.issues.map((issue) => ({
      path: issue.path,
      message: issue.message,
      code: issue.code,
    })),
  };

  return { success: false, error };
}
