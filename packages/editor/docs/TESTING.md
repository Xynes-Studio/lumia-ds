# Testing Guide for Contributors

## Overview

This project uses a **three-tier testing strategy** to ensure maintainable test coverage.

## Quick Reference

| What to test | Test type | Target coverage |
|--------------|-----------|-----------------|
| Utility functions | Unit test (`*.test.ts`) | 100% |
| Hooks & Plugins | Integration (`*.integration.test.tsx`) | 70% |
| UI Components | Storybook + play functions | Smoke |

## Writing Tests

### Tier 1: Unit Tests (Pure Functions)

```typescript
// src/utils/__tests__/myUtils.test.ts
import { myFunction } from '../myUtils';

describe('myFunction', () => {
  it('should return expected result', () => {
    expect(myFunction('input')).toBe('output');
  });
});
```

**Rule**: If your logic doesn't need React or Lexical context, extract it to `src/utils/`.

### Tier 2: Integration Tests (Hooks & Plugins)

```typescript
// src/plugins/MyPlugin.integration.test.tsx
import { renderWithEditor, simulateTyping } from '../test-utils';

describe('MyPlugin', () => {
  it('should handle user input', async () => {
    const { editor } = renderWithEditor(<MyPlugin />);
    await simulateTyping(editor, '/table');
    // Assert expected state
  });
});
```

### Tier 3: Storybook Tests

Add `play` functions for interaction testing:

```typescript
export const Interactive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    await expect(canvas.getByText('Result')).toBeVisible();
  },
};
```

## Best Practices

1. **Extract pure logic** from hooks into utility functions
2. **Use shared test utilities** from `src/test-utils/`
3. **Name tests clearly**: `should [action] when [condition]`
4. **One assertion per test** when possible

## Running Tests

```bash
pnpm test              # Run all tests
pnpm test:coverage     # With coverage report
pnpm storybook:test    # Run Storybook interaction tests
```
