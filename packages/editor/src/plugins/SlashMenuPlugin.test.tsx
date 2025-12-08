import { describe, test, expect } from 'vitest';
import { SlashMenuPlugin } from './SlashMenuPlugin';

describe('SlashMenuPlugin', () => {
  test('exports SlashMenuPlugin function', () => {
    expect(SlashMenuPlugin).toBeDefined();
    expect(typeof SlashMenuPlugin).toBe('function');
  });

  test.todo('renders with real plugin - currently disabled due to JSDOM hang');
});
