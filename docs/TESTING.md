# Testing Standards

This document is the developer-facing summary of the testing expectations defined in [ADR-001](./ADR-001-testing-standards.md).

## Required workflow

All feature work and bug fixes should follow TDD:

1. Write or update a failing test that proves the behavior gap.
2. Make the smallest implementation change that turns the test green.
3. Refactor only after the test suite is green.

## Coverage target

- Monorepo target: 80% minimum coverage.
- Pure functions in `src/utils` should aim for 100% coverage.
- React integrations in `src/hooks`, `src/components`, and plugin code should meet or exceed the package-level 80% target.

## Package structure

Keep code segregated by responsibility so tests stay focused and cheap to maintain:

```text
packages/<package>/
├── src/
│   ├── utils/       # Pure functions and transforms
│   ├── hooks/       # React hooks and state orchestration
│   ├── components/  # UI and interaction surfaces
│   ├── plugins/     # Editor/runtime behavior integrations when applicable
│   └── test-utils/  # Shared harnesses and fixtures
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
