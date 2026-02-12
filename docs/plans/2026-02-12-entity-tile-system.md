# Entity Tile System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a modular, reusable tile system in Lumia DS for App/User entities with grid/list variants, typed action callbacks, strong accessibility, and no regressions.

**Architecture:** Introduce a generic `EntityTile` base component and thin wrappers (`AppTile`, `UserTile`). Compose existing Lumia primitives (`Card`, `Avatar`, `Checkbox`, `Button`, `Icon`) and expose typed callback contracts for selection, actions, and activation.

**Tech Stack:** React 18, TypeScript, Lumia DS components package, Vitest, Storybook.

---

## Scope
- DS-only delivery in `@lumia-ui/components`.
- No app integration in this story.
- Max 3 quick actions supported.

## Files
- Create: `packages/components/src/entity-tile/entity-tile.tsx`
- Create: `packages/components/src/entity-tile/entity-tile.test.tsx`
- Create: `packages/components/src/entity-tile/entity-tile.stories.tsx`
- Create: `packages/components/src/entity-tile/index.ts`
- Modify: `packages/components/src/index.ts`
- Modify: `packages/components/src/index.test.ts`
- Create: `docs/components-entity-tile.md`

## Acceptance Criteria
- Grid/list variants implemented.
- Grid quick actions reveal on hover/focus.
- List quick actions always visible.
- Typed rich contexts for quick-action callbacks.
- Selection + activation interactions isolated and keyboard accessible.
- 3 quick action max enforced.
- Lint/test/storybook build pass.
