# BUG-LDS-1 — Dashboard shell fixed-height sidebar + scroll containment

**Story:** `xynes/xynes-infra/docs/plans/2026-05-29-q2-bugfix-sprint-stories.md` → BUG-LDS-1
**Sprint:** 2026-Q2 bug-fix sprint
**Repo:** `xynes-front-end/lumia-ds` (PR target)
**Branch:** `feature/BUG-LDS-1-shell-fixed-height-scroll-containment`

## What this directory holds

Automated Playwright screenshots demonstrating the BUG-LDS-1 scroll-containment contract on the `DashboardShell` at three viewport heights:

| File | Viewport | Source |
|---|---|---|
| `dashboard-shell-720.png` | 1440×720 | `Runtime/DashboardShell` story (`runtime-dashboardshell--basic-dashboard-shell`) |
| `dashboard-shell-900.png` | 1440×900 | same |
| `dashboard-shell-1200.png` | 1440×1200 | same |

Because Lumia DS is a design-system repo (it does not run the Auth App / CMS Console), the contract is proven against the rendered Storybook story, where Storybook resolves `@lumia-ui/layout` to source — so the screenshots exercise the branch code, not a stale build. Consuming apps inherit the fix unchanged.

## How the screenshots are generated

```bash
pnpm storybook:build                 # rebuilds storybook-static from package source
pnpm exec playwright test e2e/dashboard-shell-scroll.spec.ts --project=chromium
```

The spec (`e2e/dashboard-shell-scroll.spec.ts`) writes the PNGs into this directory and asserts, at real runtime layout, for each height:

1. `document.documentElement.scrollHeight - clientHeight <= 1` — the page itself is **not** scrollable (`h-dvh overflow-hidden` root).
2. The right content panel (`data-testid="dashboard-main-scroll-frame"`) **does** overflow and scroll when content exceeds the viewport (`overflow-y-auto`).
3. The bottom-anchored profile (`data-testid="dashboard-profile-trigger"`) does **not** move when the right pane is scrolled, and stays within the viewport — i.e. the rail's switcher/profile stay pinned.

This replaces the earlier manual-capture checklist. Per sprint plan §7, Playwright authoring was optional for this sprint; it is wired here because the harness was already set up and it gives the runtime proof the jsdom unit tests cannot.

## Visual checks (confirmed in the captured PNGs)

1. Workspace switcher at the top of the left rail is fully visible and anchored.
2. Profile menu + footer at the bottom of the left rail are fully visible and anchored.
3. The right content panel holds the page content; tall content scrolls inside it only.
4. No double scrollbars.

## Follow-up

- Live-app visual smoke (Auth App `:3100`, CMS Console `:3000`) and pseudo-locale (`en-XA`) rail capture remain useful end-to-end checks but belong to the consuming-app stories (BUG-AUTH-1 / BUG-CMS-9), since this repo does not run those apps.
- The Playwright spec can be promoted into CI alongside the existing `e2e/visual.spec.ts` suite.
