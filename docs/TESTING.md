# Testing Guide for Contributors (DS-951)

Global testing standards and contributor guidelines for the Lumia Design System monorepo.

## Overview

This monorepo uses a **three-tier testing strategy** to achieve maintainable test coverage. Current global coverage: **75%**.

See [ADR-001](./ADR-001-testing-standards.md) for decision rationale.

## Quick Reference

| What to test | Test type | Target coverage |
|--------------|-----------|-----------------|
| Utility functions | Unit (`*.test.ts`) | 100% |
| Hooks & Plugins | Integration (`*.integration.test.tsx`) | 70% |
| UI Components | Storybook + play functions | Smoke |
| User interactions | Interaction (`*.interaction.test.tsx`) | Key flows |

## Writing Tests

### Tier 1: Unit Tests (Pure Functions)

```typescript
// src/utils/__tests__/formatters.test.ts
import { formatCurrency } from '../formatters';

describe('formatCurrency', () => {
  it('should format USD correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });
});
```

**Rule**: If logic doesn't need React/DOM context, extract it to `src/utils/`.

### Tier 2: Integration Tests (Components & Hooks)

```typescript
// src/components/Form.integration.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from './Form';

describe('Form', () => {
  it('should submit valid data', async () => {
    const onSubmit = vi.fn();
    render(<Form onSubmit={onSubmit} />);
    
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    
    expect(onSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
  });
});
```

### Tier 3: Storybook Tests

Add `play` functions for interaction testing:

```typescript
// Button.stories.tsx
export const Interactive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    await expect(canvas.getByText('Clicked!')).toBeVisible();
  },
};
```

## Best Practices

### Do's ✅

1. **Extract pure logic** from hooks into utility functions
2. **Use shared test utilities** from `src/test-utils/`
3. **Name tests clearly**: `should [action] when [condition]`
4. **One assertion per test** when practical
5. **Test behavior, not implementation**

### Don'ts ❌

1. **Don't mock heavily** - prefer integration tests with real dependencies
2. **Don't test private methods** - test through public interface
3. **Don't snapshot everything** - only stable, visual output

## Running Tests

```bash
# From monorepo root
pnpm test                    # Run all tests
pnpm test --filter=@lumia/*  # Tests for all Lumia packages

# From package directory
pnpm test                    # Run package tests
pnpm test:coverage           # With coverage report
pnpm storybook:test          # Run Storybook interaction tests
```

## Coverage Thresholds

Configure in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        lines: 75,
        functions: 75,
        branches: 70,
        statements: 75,
      },
    },
  },
});
```

## CI Integration

Pull requests require:
- All tests passing
- No decrease in coverage
- Storybook build success

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Flaky tests | Ensure proper async handling with `waitFor` |
| Slow tests | Move logic to Tier 1 pure functions |
| Hard to test | Refactor to extract pure logic |
