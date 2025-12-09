import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import {
  BlockSchemaSchema,
  ComponentKindSchema,
  DataQueryContextSchema,
  DataSourceResultSchema,
  GridPlacementSchema,
  PageGridSchema,
  PageSchemaSchema,
  ResourceConfigSchema,
  ResourcePageRefsSchema,
  ResourceScreenSchema,
} from './index';

describe('ComponentKindSchema', () => {
  it('parses valid component kinds', () => {
    expect(ComponentKindSchema.parse('table')).toBe('table');
    expect(ComponentKindSchema.parse('detail')).toBe('detail');
    expect(ComponentKindSchema.parse('form')).toBe('form');
    expect(ComponentKindSchema.parse('card-list')).toBe('card-list');
    expect(ComponentKindSchema.parse('stat')).toBe('stat');
  });

  it('throws ZodError for invalid kind', () => {
    expect(() => ComponentKindSchema.parse('unknown')).toThrow(ZodError);
    expect(() => ComponentKindSchema.parse('')).toThrow(ZodError);
    expect(() => ComponentKindSchema.parse(123)).toThrow(ZodError);
  });
});

describe('BlockSchemaSchema', () => {
  it('parses valid block with required fields', () => {
    const validBlock = { id: 'block-1', kind: 'table' };
    const result = BlockSchemaSchema.parse(validBlock);
    expect(result).toEqual({ id: 'block-1', kind: 'table' });
  });

  it('parses valid block with all optional fields', () => {
    const validBlock = {
      id: 'block-2',
      kind: 'form',
      title: 'User Form',
      dataSourceId: 'users',
      props: { columns: 2, submitLabel: 'Save' },
    };
    const result = BlockSchemaSchema.parse(validBlock);
    expect(result).toEqual(validBlock);
  });

  it('throws ZodError when id is missing', () => {
    expect(() => BlockSchemaSchema.parse({ kind: 'table' })).toThrow(ZodError);
  });

  it('throws ZodError when kind is missing', () => {
    expect(() => BlockSchemaSchema.parse({ id: 'block-1' })).toThrow(ZodError);
  });

  it('throws ZodError for invalid kind value', () => {
    expect(() =>
      BlockSchemaSchema.parse({ id: 'block-1', kind: 'invalid' }),
    ).toThrow(ZodError);
  });
});

describe('GridPlacementSchema', () => {
  it('parses valid placement with required fields', () => {
    const valid = { blockId: 'b1', column: 1, row: 1 };
    expect(GridPlacementSchema.parse(valid)).toEqual(valid);
  });

  it('parses valid placement with spans', () => {
    const valid = {
      blockId: 'b2',
      column: 2,
      row: 1,
      columnSpan: 2,
      rowSpan: 3,
    };
    expect(GridPlacementSchema.parse(valid)).toEqual(valid);
  });

  it('throws ZodError when blockId is missing', () => {
    expect(() => GridPlacementSchema.parse({ column: 1, row: 1 })).toThrow(
      ZodError,
    );
  });
});

describe('PageGridSchema', () => {
  it('parses valid grid with placements', () => {
    const valid = {
      columns: 3,
      gap: 16,
      placements: [{ blockId: 'b1', column: 1, row: 1 }],
    };
    expect(PageGridSchema.parse(valid)).toEqual(valid);
  });

  it('parses grid with only placements (optional columns/gap)', () => {
    const valid = {
      placements: [{ blockId: 'b1', column: 1, row: 1 }],
    };
    expect(PageGridSchema.parse(valid)).toEqual(valid);
  });

  it('throws ZodError when placements is missing', () => {
    expect(() => PageGridSchema.parse({ columns: 2 })).toThrow(ZodError);
  });
});

describe('PageSchemaSchema', () => {
  it('parses valid page with required fields', () => {
    const valid = {
      id: 'page-1',
      layout: 'stack',
      blocks: [],
    };
    expect(PageSchemaSchema.parse(valid)).toEqual(valid);
  });

  it('parses valid page with blocks and grid', () => {
    const valid = {
      id: 'page-2',
      layout: 'admin-shell',
      blocks: [{ id: 'block-1', kind: 'table' }],
      grid: {
        columns: 2,
        placements: [{ blockId: 'block-1', column: 1, row: 1 }],
      },
    };
    expect(PageSchemaSchema.parse(valid)).toEqual(valid);
  });

  it('throws ZodError for invalid layout', () => {
    expect(() =>
      PageSchemaSchema.parse({ id: 'p1', layout: 'invalid', blocks: [] }),
    ).toThrow(ZodError);
  });

  it('validates nested blocks', () => {
    expect(() =>
      PageSchemaSchema.parse({
        id: 'p1',
        layout: 'drawer',
        blocks: [{ id: 'b1' }], // missing kind
      }),
    ).toThrow(ZodError);
  });
});

describe('ResourceScreenSchema', () => {
  it('parses valid screens', () => {
    expect(ResourceScreenSchema.parse('list')).toBe('list');
    expect(ResourceScreenSchema.parse('detail')).toBe('detail');
    expect(ResourceScreenSchema.parse('create')).toBe('create');
    expect(ResourceScreenSchema.parse('update')).toBe('update');
  });

  it('throws ZodError for invalid screen', () => {
    expect(() => ResourceScreenSchema.parse('delete')).toThrow(ZodError);
  });
});

describe('ResourcePageRefsSchema', () => {
  it('parses valid page refs', () => {
    const valid = {
      list: 'users-list',
      detail: 'user-detail',
      create: 'user-create',
    };
    expect(ResourcePageRefsSchema.parse(valid)).toEqual(valid);
  });

  it('parses empty object', () => {
    expect(ResourcePageRefsSchema.parse({})).toEqual({});
  });
});

describe('ResourceConfigSchema', () => {
  it('parses valid resource config', () => {
    const valid = {
      id: 'users',
      pages: { list: 'users-list' },
    };
    expect(ResourceConfigSchema.parse(valid)).toEqual(valid);
  });

  it('parses resource with fields and dataFetcher', () => {
    const valid = {
      id: 'members',
      fields: [{ name: 'email', label: 'Email' }],
      dataFetcher: { create: () => {} },
    };
    const result = ResourceConfigSchema.parse(valid);
    expect(result.id).toBe('members');
    expect(result.fields).toHaveLength(1);
  });

  it('throws ZodError when id is missing', () => {
    expect(() => ResourceConfigSchema.parse({})).toThrow(ZodError);
  });
});

describe('DataQueryContextSchema', () => {
  it('parses valid context', () => {
    const valid = {
      resource: { id: 'users' },
      screen: 'list',
    };
    expect(DataQueryContextSchema.parse(valid)).toEqual(valid);
  });

  it('parses context with params and permissions', () => {
    const valid = {
      resource: { id: 'users' },
      screen: 'detail',
      params: { id: '123' },
      permissions: ['read:users', 'write:users'],
    };
    expect(DataQueryContextSchema.parse(valid)).toEqual(valid);
  });

  it('throws ZodError for invalid screen', () => {
    expect(() =>
      DataQueryContextSchema.parse({
        resource: {},
        screen: 'invalid',
      }),
    ).toThrow(ZodError);
  });
});

describe('DataSourceResultSchema', () => {
  it('parses valid result with records', () => {
    const valid = {
      records: [{ id: '1', name: 'User 1' }],
    };
    expect(DataSourceResultSchema.parse(valid)).toEqual(valid);
  });

  it('parses valid result with single record', () => {
    const valid = {
      record: { id: '1', name: 'User 1' },
    };
    expect(DataSourceResultSchema.parse(valid)).toEqual(valid);
  });

  it('parses valid result with initialValues', () => {
    const valid = {
      initialValues: { name: '', email: '' },
    };
    expect(DataSourceResultSchema.parse(valid)).toEqual(valid);
  });

  it('parses empty object', () => {
    expect(DataSourceResultSchema.parse({})).toEqual({});
  });
});
