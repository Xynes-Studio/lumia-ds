/**
 * Invalid JSON fixtures for testing validation utilities.
 */

/** Missing required 'id' field */
export const invalidPageMissingId = {
  layout: 'stack',
  blocks: [],
};

/** Invalid layout enum value */
export const invalidPageBadLayout = {
  id: 'test-page',
  layout: 'invalid-layout',
  blocks: [],
};

/** Missing required 'kind' in blocks */
export const invalidPageMissingBlockKind = {
  id: 'test-page',
  layout: 'admin-shell',
  blocks: [{ id: 'block-1' }],
};

/** Invalid 'kind' enum value in blocks */
export const invalidPageBadBlockKind = {
  id: 'test-page',
  layout: 'stack',
  blocks: [{ id: 'block-1', kind: 'invalid-kind' }],
};

/** Nested validation failure - invalid grid placement */
export const invalidPageBadGridPlacement = {
  id: 'test-page',
  layout: 'stack',
  blocks: [{ id: 'block-1', kind: 'table' }],
  grid: {
    placements: [{ blockId: 'block-1' }], // missing column and row
  },
};

/** Valid page config for comparison */
export const validPageConfig = {
  id: 'test-page',
  layout: 'admin-shell',
  blocks: [
    { id: 'block-1', kind: 'table' },
    { id: 'block-2', kind: 'detail', title: 'Details' },
  ],
  grid: {
    columns: 2,
    placements: [{ blockId: 'block-1', column: 1, row: 1 }],
  },
};

/** Missing required 'id' field in resource */
export const invalidResourceMissingId = {
  pages: { list: 'users-list' },
};

/** Valid resource config */
export const validResourceConfig = {
  id: 'users',
  pages: { list: 'users-list', detail: 'user-detail' },
};

/** Invalid data source with wrong type for records */
export const invalidDataSourceBadRecordsType = {
  records: 'not-an-array',
};

/** Valid data source result */
export const validDataSourceResult = {
  records: [{ id: '1', name: 'Test' }],
  record: { id: '1', name: 'Test Record' },
};

/** Completely wrong type */
export const invalidNotAnObject = 'not-an-object';

/** Null value */
export const invalidNullValue = null;
