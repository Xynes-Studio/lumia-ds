import { describe, expect, it } from 'vitest';
import { validateBlock } from '../block-validator';

describe('validateBlock', () => {
  describe('valid blocks', () => {
    it('returns success for valid block with required fields', () => {
      const validBlock = {
        id: 'block-1',
        kind: 'table',
      };

      const result = validateBlock(validBlock, 'block-1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('block-1');
        expect(result.data.kind).toBe('table');
      }
    });

    it('returns success for block with optional fields', () => {
      const validBlock = {
        id: 'block-1',
        kind: 'detail',
        title: 'My Block',
        dataSourceId: 'users',
        props: { columns: [] },
      };

      const result = validateBlock(validBlock, 'block-1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('My Block');
        expect(result.data.dataSourceId).toBe('users');
      }
    });
  });

  describe('invalid blocks', () => {
    it('returns error when id is missing', () => {
      const invalidBlock = {
        kind: 'table',
      };

      const result = validateBlock(invalidBlock, 'fallback-id');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('block-config-error');
        expect(result.error.blockId).toBe('fallback-id');
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            path: ['id'],
            code: 'invalid_type',
          }),
        );
      }
    });

    it('returns error for invalid kind', () => {
      const invalidBlock = {
        id: 'block-1',
        kind: 'invalid-kind',
      };

      const result = validateBlock(invalidBlock, 'block-1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            path: ['kind'],
            code: 'invalid_enum_value',
          }),
        );
      }
    });

    it('returns error when kind is missing', () => {
      const invalidBlock = {
        id: 'block-1',
      };

      const result = validateBlock(invalidBlock, 'block-1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            path: ['kind'],
            code: 'invalid_type',
          }),
        );
      }
    });

    it('handles non-object input gracefully', () => {
      const result = validateBlock('not-an-object', 'block-1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('block-config-error');
      }
    });

    it('handles null input gracefully', () => {
      const result = validateBlock(null, 'block-1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('block-config-error');
      }
    });
  });
});
