/**
 * Fixture-based validation tests for runtime schemas.
 *
 * These tests use JSON fixtures to guarantee schema stability.
 * CI will fail if schema shapes change without updating fixtures.
 */
import { describe, expect, it } from 'vitest';
import {
  BlockSchemaSchema,
  PageSchemaSchema,
  ResourceConfigSchema,
} from '../index';

// Valid fixtures
import validPage from './fixtures/valid-page.json';
import validBlock from './fixtures/valid-block.json';
import validResource from './fixtures/valid-resource.json';

// Invalid fixtures
import invalidPageMissingId from './fixtures/invalid-page-missing-id.json';
import invalidPageBadLayout from './fixtures/invalid-page-bad-layout.json';
import invalidBlockMissingKind from './fixtures/invalid-block-missing-kind.json';
import invalidBlockWrongType from './fixtures/invalid-block-wrong-type.json';
import invalidResourceMissingId from './fixtures/invalid-resource-missing-id.json';

describe('Fixture-based Schema Validation', () => {
  describe('PageSchemaSchema', () => {
    describe('valid fixtures', () => {
      it('parses valid-page.json successfully', () => {
        const result = PageSchemaSchema.safeParse(validPage);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.id).toBe('users-list-page');
          expect(result.data.layout).toBe('admin-shell');
          expect(result.data.blocks).toHaveLength(2);
          expect(result.data.grid?.columns).toBe(2);
          expect(result.data.grid?.placements).toHaveLength(2);
        }
      });
    });

    describe('invalid fixtures', () => {
      it('fails invalid-page-missing-id.json with error at path ["id"]', () => {
        const result = PageSchemaSchema.safeParse(invalidPageMissingId);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toContainEqual(
            expect.objectContaining({
              path: ['id'],
              code: 'invalid_type',
            }),
          );
        }
      });

      it('fails invalid-page-bad-layout.json with error at path ["layout"]', () => {
        const result = PageSchemaSchema.safeParse(invalidPageBadLayout);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toContainEqual(
            expect.objectContaining({
              path: ['layout'],
              code: 'invalid_enum_value',
            }),
          );
          // Verify the message indicates valid options
          const layoutIssue = result.error.issues.find((i) =>
            i.path.includes('layout'),
          );
          expect(layoutIssue?.message).toContain('Invalid enum value');
        }
      });
    });
  });

  describe('BlockSchemaSchema', () => {
    describe('valid fixtures', () => {
      it('parses valid-block.json successfully', () => {
        const result = BlockSchemaSchema.safeParse(validBlock);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.id).toBe('detail-block-1');
          expect(result.data.kind).toBe('detail');
          expect(result.data.title).toBe('User Details');
          expect(result.data.dataSourceId).toBe('user-detail-source');
          expect(result.data.props).toBeDefined();
        }
      });
    });

    describe('invalid fixtures', () => {
      it('fails invalid-block-missing-kind.json with error at path ["kind"]', () => {
        const result = BlockSchemaSchema.safeParse(invalidBlockMissingKind);

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

      it('fails invalid-block-wrong-type.json with invalid_enum_value error', () => {
        const result = BlockSchemaSchema.safeParse(invalidBlockWrongType);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toContainEqual(
            expect.objectContaining({
              path: ['kind'],
              code: 'invalid_enum_value',
            }),
          );
          // Verify error message is developer-friendly
          const kindIssue = result.error.issues.find((i) =>
            i.path.includes('kind'),
          );
          expect(kindIssue?.message).toContain('Invalid enum value');
        }
      });
    });
  });

  describe('ResourceConfigSchema', () => {
    describe('valid fixtures', () => {
      it('parses valid-resource.json successfully', () => {
        const result = ResourceConfigSchema.safeParse(validResource);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.id).toBe('users');
          expect(result.data.pages?.list).toBe('users-list-page');
          expect(result.data.pages?.detail).toBe('user-detail-page');
          expect(result.data.fields).toHaveLength(2);
        }
      });
    });

    describe('invalid fixtures', () => {
      it('fails invalid-resource-missing-id.json with error at path ["id"]', () => {
        const result = ResourceConfigSchema.safeParse(invalidResourceMissingId);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toContainEqual(
            expect.objectContaining({
              path: ['id'],
              code: 'invalid_type',
            }),
          );
        }
      });
    });
  });

  describe('Schema Stability Contract', () => {
    it('ensures PageSchemaSchema requires id, layout, and blocks', () => {
      // Verify required fields by testing empty object
      const result = PageSchemaSchema.safeParse({});

      expect(result.success).toBe(false);
      if (!result.success) {
        const pathStrings = result.error.issues.map((i) => i.path.join('.'));
        expect(pathStrings).toContain('id');
        expect(pathStrings).toContain('layout');
        expect(pathStrings).toContain('blocks');
      }
    });

    it('ensures BlockSchemaSchema requires id and kind', () => {
      const result = BlockSchemaSchema.safeParse({});

      expect(result.success).toBe(false);
      if (!result.success) {
        const pathStrings = result.error.issues.map((i) => i.path.join('.'));
        expect(pathStrings).toContain('id');
        expect(pathStrings).toContain('kind');
      }
    });

    it('ensures ResourceConfigSchema requires id', () => {
      const result = ResourceConfigSchema.safeParse({});

      expect(result.success).toBe(false);
      if (!result.success) {
        const pathStrings = result.error.issues.map((i) => i.path.join('.'));
        expect(pathStrings).toContain('id');
      }
    });

    it('ensures ComponentKind enum contains expected values', () => {
      // This test documents the expected enum values
      const validKinds = ['table', 'detail', 'form', 'card-list', 'stat'];

      for (const kind of validKinds) {
        const result = BlockSchemaSchema.safeParse({ id: 'test', kind });
        expect(result.success).toBe(true);
      }
    });

    it('ensures layout enum contains expected values', () => {
      const validLayouts = ['admin-shell', 'stack', 'drawer'];

      for (const layout of validLayouts) {
        const result = PageSchemaSchema.safeParse({
          id: 'test',
          layout,
          blocks: [],
        });
        expect(result.success).toBe(true);
      }
    });
  });
});
