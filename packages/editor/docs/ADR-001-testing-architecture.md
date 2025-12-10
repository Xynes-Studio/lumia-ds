# ADR-001: Standardized Testing Architecture

**Status**: Proposed  
**Date**: 2025-12-09  
**Context**: `@lumia/editor` open source project

## Problem

The editor package has inconsistent test coverage due to:
1. Tight coupling between React hooks and Lexical editor state
2. No standardized approach for testing editor-dependent code
3. Contributors lack clear guidance on how to write tests

## Decision

Adopt a **three-tier testing architecture**:

```
┌──────────────────────────────────────────────────────┐
│ Tier 1: Pure Function Tests (100% coverage target)  │
│ • Utils in src/utils/                               │
│ • No React, no DOM, no Lexical                      │
│ • Fast execution, easy to maintain                  │
└──────────────────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────┐
│ Tier 2: Integration Tests (70% coverage target)     │
│ • Hooks and plugins                                 │
│ • Uses shared LexicalTestHarness                    │
│ • Real editor with controlled state                 │
└──────────────────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────┐
│ Tier 3: E2E/Storybook Tests (Smoke coverage)        │
│ • @storybook/test-runner + Playwright               │
│ • Visual regression, real browser                   │
└──────────────────────────────────────────────────────┘
```

## Implementation

### 1. Create `src/test-utils/` directory

```typescript
// src/test-utils/LexicalTestHarness.tsx
export function createTestEditor(config?: Partial<EditorConfig>)
export function renderWithEditor(ui: ReactElement)
export function waitForEditorUpdate(editor: LexicalEditor)
export function simulateTyping(editor: LexicalEditor, text: string)
```

### 2. Pattern: Extract Pure Logic from Hooks

**Before** (hard to test):
```typescript
export function useSlashMenuQuery({ editor, isOpen }) {
  useEffect(() => {
    editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        // 80 lines of logic here
      });
    });
  }, [...]);
}
```

**After** (testable):
```typescript
// Pure function - easily unit tested
export function processQueryUpdate(
  node: LexicalNode,
  triggerOffset: number,
  selection: RangeSelection
): { query: string; shouldClose: boolean } {
  // Logic extracted here
}

// Hook becomes thin wrapper
export function useSlashMenuQuery({ editor, isOpen }) {
  useEffect(() => {
    editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const result = processQueryUpdate(...);
        // Simple branching only
      });
    });
  }, [...]);
}
```

### 3. File Naming Conventions

| Test Type | Pattern | Example |
|-----------|---------|---------|
| Unit tests | `*.test.ts` | `slashMenuUtils.test.ts` |
| Integration | `*.integration.test.tsx` | `SlashMenuPlugin.integration.test.tsx` |
| Storybook | Add `play` function | `SlashMenu.stories.tsx` |

## Consequences

**Positive:**
- Clear contribution guidelines
- Predictable test patterns
- Higher maintainable coverage

**Negative:**
- Initial refactoring effort
- More files (utils separate from hooks)

## Action Items

1. Create `src/test-utils/` with shared harness
2. Add `TESTING.md` to document conventions
3. Refactor top 5 low-coverage hooks to extract pure logic
