# ADR-001: Global Testing Standards (DS-950)

**Status**: Approved  
**Date**: 2025-12-09  
**Context**: `lumia-ds` monorepo  
**Related**: See `packages/editor/docs/ADR-001-testing-architecture.md` for editor-specific patterns

## Problem

The monorepo lacks unified testing standards across packages, leading to:
1. Inconsistent test coverage between packages
2. No clear guidance for contributors on testing approach
3. Difficulty maintaining quality standards as the codebase grows

## Decision

Adopt a **three-tier testing architecture** across all packages:

```
┌──────────────────────────────────────────────────────┐
│ Tier 1: Pure Function Tests (100% coverage target)  │
│ • Business logic, transformations, utilities        │
│ • No React, no DOM dependencies                     │
│ • Fast, deterministic, easy to maintain             │
└──────────────────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────┐
│ Tier 2: Integration Tests (70% coverage target)     │
│ • Component interactions, hooks, plugins            │
│ • Uses shared test utilities per package            │
│ • Real browser/DOM environment (JSDOM/Vitest)       │
└──────────────────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────┐
│ Tier 3: E2E/Storybook Tests (Smoke coverage)        │
│ • @storybook/test-runner + Playwright               │
│ • Visual regression testing                         │
│ • Real browser, full user flows                     │
└──────────────────────────────────────────────────────┘
```

## Current Coverage

| Package | Current | Target |
|---------|---------|--------|
| Global  | **75%** | 80%    |
| Editor  | 75%     | 80%    |
| UI      | TBD     | 80%    |

## Implementation

### 1. Extract Pure Logic Pattern

**Before** (hard to test):
```typescript
export function useComplexHook({ data }) {
  useEffect(() => {
    // 80 lines of business logic mixed with React
  }, [...]);
}
```

**After** (testable):
```typescript
// Pure function - easily unit tested in src/utils/
export function processData(input: DataInput): ProcessedResult {
  // Business logic extracted
}

// Hook becomes thin wrapper
export function useComplexHook({ data }) {
  useEffect(() => {
    const result = processData(data);
    // Simple state updates only
  }, [...]);
}
```

### 2. File Organization

```
packages/<package>/
├── src/
│   ├── utils/           # Pure functions (Tier 1)
│   ├── hooks/           # React hooks (Tier 2)
│   ├── components/      # UI components (Tier 2 + 3)
│   └── test-utils/      # Shared test helpers
└── docs/
    └── TESTING.md       # Package-specific testing guide
```

### 3. Naming Conventions

| Test Type | Pattern | Example |
|-----------|---------|---------|
| Unit tests | `*.test.ts` | `parseUtils.test.ts` |
| Integration | `*.integration.test.tsx` | `Form.integration.test.tsx` |
| Interaction | `*.interaction.test.tsx` | `Menu.interaction.test.tsx` |
| Storybook | Add `play` function | `Button.stories.tsx` |

## Consequences

**Positive:**
- Consistent testing approach across all packages
- Clear contributor guidelines
- Higher maintainable coverage metrics
- Faster CI feedback loops (Tier 1 tests run first)

**Negative:**
- Initial migration effort for legacy code
- More files (utils separate from hooks)
- Learning curve for new contributors

## Action Items

1. ✅ Establish ADR and testing guidelines
2. [ ] Create `TESTING.md` in global docs
3. [ ] Add shared test utilities per package
4. [ ] Migrate top low-coverage files to pattern
5. [ ] Add coverage gates in CI pipeline
