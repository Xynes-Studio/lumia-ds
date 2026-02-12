# Dashboard Shell Layout System (DS-Only) Implementation Plan

> Story scope: `lumia-ds` only. No `xynes-auth-app` migration in this story.

## Goal

Create a reusable, auth-agnostic, router-agnostic dashboard layout shell in `@lumia-ui/layout` with strong accessibility defaults, test coverage, and developer-friendly APIs.

## Scope

- Add `DashboardShell`, `DashboardSidebarSection`, and `DashboardMainSection` to `@lumia-ui/layout`.
- Add exported types: `DashboardNavItem`, `DashboardWorkspace`, `DashboardUserMenu`, `DashboardNotification`, `DashboardShellProps`.
- Add route-match helper logic as pure utilities with Tier 1 tests.
- Add layout integration tests for nav active state, callbacks, profile menu, notifications popover, and focus return behavior.
- Add runtime story and docs page for consumption guidance.

## Non-Goals

- No auth-sdk integration.
- No app-specific routing implementation.
- No dashboard data fetching.
- No auth-app page migration.

## Security Requirements

- No token/session handling in DS.
- No URL redirect construction/validation in DS.
- Callback-only actions (`onNavigate`, `onWorkspaceSelect`, `onLogout`, etc.).
- No network calls in shell code.

## Accessibility Requirements

- Semantic landmarks (`aside`, `nav`, `main`).
- Keyboard operable menu/popover controls.
- `aria-current="page"` for active nav item.
- Proper labels for icon-only actions.
- Focus restoration when overlays close.

## Test Matrix

1. Renders workspace switcher trigger, nav items, footer actions, and main slot.
2. Marks active nav item based on route helper.
3. Calls `onNavigate` with selected nav item metadata.
4. Calls `onWorkspaceSelect` with selected workspace id.
5. Opens profile menu and triggers profile/logout callbacks.
6. Opens notifications popover in both empty and populated states.
7. Restores focus to overlay trigger after close.
8. Preserves responsive slots (`mobile` + `desktop`) and sidebar/main landmarks.
9. Barrel exports include all public shell symbols.

## Verification Commands

- `pnpm --filter @lumia-ui/layout test`
- `pnpm --filter @lumia-ui/layout exec vitest run --coverage`
- `pnpm --filter @lumia-ui/layout build`
- `pnpm --filter @lumia-ui/layout lint` (via repo root lint, scoped output check)

## Coverage Targets

- Tier 1 pure logic: 100%.
- Tier 2 integration: 70%+.
- Story scope should maintain >= 80% overall threshold for touched package.
