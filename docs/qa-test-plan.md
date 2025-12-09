# Lumia DS QA Strategy (DS-900)

P0-quality guardrails for Lumia Design System across components, runtime blocks, icons, layout, and forms. Targets Storybook as the primary surface with Atlas Browser for cross-browser validation.

P0-quality guardrails for Lumia Design System across components, runtime blocks, icons, layout, and forms. Targets Storybook as the primary surface with Atlas Browser for cross-browser validation.

## Visual Regression Testing (INF-501)
We use **Playwright** to catch visual regressions in core components.
- **Run tests:** `pnpm test:visual`
- **Update snapshots:** `pnpm test:visual:update`
- **CI:** Tests run automatically on PRs via GitHub Actions.
- **Scope:** Button, Table, Editor, and other core primitives.

## Goals & Scope
- Catch visual/interaction regressions before public release.
- Validate accessibility, responsive behavior, theming, and RTL where applicable.
- Ensure stories exist and stay accurate for new/changed primitives.
- Produce traceable issue logs and documented runs.

Out of scope: performance benchmarking, backend/service tests.

## Environments & Surfaces
- **Storybook (local):** `STORYBOOK_DISABLE_TELEMETRY=1 pnpm storybook` for interactive review; `pnpm storybook:build` for static deployable build.
- **Atlas Browser (cross-browser):** Use to hit local Storybook or a hosted static build. Target latest stable Chrome, Firefox, Safari 17+, Edge. Record runs in `docs/qa-issue-log.md`.
- **CI/CLI checks:** `pnpm lint`, `pnpm type-check`, `pnpm test` (where packages provide tests), `pnpm build` for release-candidate sanity.

## Workflow
- **Per PR (dev + reviewer)**
  - Update or add stories for new/changed components/blocks.
  - Run `pnpm lint` and `pnpm type-check` (fail PR if broken).
  - Storybook spot-check on touched stories; execute the checklist in `docs/qa-component-checklist.md`.
  - Log defects as GitHub issues with the `qa` label (template in `docs/qa-issue-log.md`).
- **Pre-merge to main**
  - Storybook smoke: load default, error, and interactive states for touched components; validate keyboard + a11y addon for critical flows.
  - Confirm static build works: `pnpm storybook:build` (or verify CI artifact).
- **Pre-release (RC)**
  - Full `pnpm build` across workspaces.
  - Atlas cross-browser exploratory run (charter below) against the RC Storybook URL.
  - Triage all `qa` issues; must be fixed or explicitly waived with rationale.

## Test Types
- **Visual & theming:** align with design tokens, spacing, typography, dark/light if supported.
- **Interaction:** hover/focus/active/disabled, loading states, error handling, gestures (drag/drop) where present.
- **Accessibility:** ARIA roles/labels, focus order, trap avoidance, screen-reader semantics, color contrast, keyboard parity.
- **Responsiveness:** small viewport (mobile), medium (tablet), wide desktop; RTL where applicable.
- **Runtime integration:** blocks render with default schemas; icons load without missing glyphs.

## Atlas Exploratory Session 001 (charter)
- **Purpose:** Cross-browser smoke of core primitives + runtime blocks ahead of release.
- **Browers:** Chrome latest, Firefox latest, Safari 17+, Edge latest.
- **Entry:** RC Storybook URL or tunneled local build; `pnpm storybook:build` if static is needed.
- **Focus:** Layout primitives (Stack/Grid), form controls (Input, Select, Checkbox, Radio, Button), Tabs, Modals/Dialogs, critical icons.
- **Heuristics:** keyboard navigation, focus visibility, text scaling/zoom at 125%, responsive resizing to 375px width, theme switch if available.
- **Artifacts:** screenshots for visual regressions; video for interaction regressions; log findings in `docs/qa-issue-log.md`.
- **Status:** Pending execution—run once Atlas access is available and record outcomes in the log.

## Issue Logging & Tracking
- Record every finding (including flaky behavior) as a GitHub issue tagged `qa` and scoped to the affected package.
- Use the template in `docs/qa-issue-log.md`; link the Storybook story ID and Atlas session ID.
- Track runs and outcomes in the run log table to show coverage history.

## Ownership & Cadence
- **Owners:** Engineering + Design share responsibility; QA/Release lead signs off before public release.
- **Cadence:** Per-PR checklist, weekly Storybook sweep during active development, Atlas cross-browser before each RC.
