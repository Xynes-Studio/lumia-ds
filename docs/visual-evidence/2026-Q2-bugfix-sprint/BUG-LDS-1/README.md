# BUG-LDS-1 — Dashboard shell fixed-height sidebar + scroll containment

**Story:** `xynes/xynes-infra/docs/plans/2026-05-29-q2-bugfix-sprint-stories.md` → BUG-LDS-1
**Sprint:** 2026-Q2 bug-fix sprint
**Repo:** `xynes-front-end/lumia-ds` (PR target)
**Branch:** `feature/BUG-LDS-1-shell-fixed-height-scroll-containment`

## What this directory holds

Manual browser smoke screenshots demonstrating the BUG-LDS-1 contract on both consuming apps at three viewport heights. Per sprint plan §7, manual screenshots are accepted for this sprint; Playwright automation is deferred to a follow-up.

## Capture checklist

For each cell below, capture a PNG. Use Chrome DevTools device toolbar with custom viewport sizes (Cmd+Shift+M → Responsive → set viewport).

| App | URL | Viewport heights | Expected file |
|---|---|---|---|
| Auth App | `http://localhost:3100/dashboard/<workspaceSlug>` | 720, 900, 1200 px @ 1440 px wide | `auth-app-{720,900,1200}.png` |
| CMS Console | `http://localhost:3000/dashboard/<workspaceSlug>/content` | 720, 900, 1200 px @ 1440 px wide | `cms-console-{720,900,1200}.png` |

Six PNG files total.

## Per-screenshot smoke checks (must all pass before saving the PNG)

For every screenshot, open the DevTools console and confirm:

```js
document.documentElement.scrollHeight === document.documentElement.clientHeight
// must return: true
```

This proves the page itself is not scrollable — the entire layout is locked to the viewport via the new `h-dvh overflow-hidden` root contract.

Visual checks:

1. The workspace switcher at the top of the left rail is **fully visible**.
2. The profile menu + footer at the bottom of the left rail are **fully visible**.
3. Scrolling the page (mouse wheel over content, or arrow keys focused on the content area) scrolls the **right content panel only** — the sidebar stays put.
4. Scrolling inside the sidebar (mouse wheel over the nav region) scrolls the **middle nav slot only** — workspace switcher + profile menu stay anchored.
5. No double scrollbars anywhere on the page.

## Pseudo-locale smoke

Repeat the auth-app capture at 900 px once more with `en-XA` pseudo-locale active (set via the locale cookie or query, per `xynes-front-end/xynes-auth-app/DEVELOPER.md`). Save as `auth-app-900-en-XA.png`. Confirm no label overlap or clipping in the rail.

## Local stack bring-up

From the workspace root:

```bash
cd xynes-front-end/infra
cp -n .env.example .env   # if .env doesn't exist yet
./run.sh up:dev
./run.sh health           # confirm both apps healthy
```

Both apps live on:
- Auth App → `http://localhost:3100`
- CMS Console → `http://localhost:3000`

Once both serve a dashboard route, run the captures and commit the PNGs to this directory in a follow-up commit.

## Why this directory exists pre-screenshots

Per the sprint plan §6 "Definition of done", `xynes-front-end/lumia-ds/docs/visual-evidence/2026-Q2-bugfix-sprint/` must be populated. The PR that lands the BUG-LDS-1 code change creates this directory; the operator/reviewer captures the PNGs once both apps are running with the new lumia-ds build pulled in via `link:` (auth-app) or rebuilt `dist/` (cms-console). The smoke runs in **under 5 minutes**.

## Verification automation (deferred)

A future story should wire Playwright `screenshot()` calls so the smoke is run on every PR. Sprint plan §7 explicitly defers this. The Vitest layout-contract tests in `dashboard-shell.test.tsx` already lock the classNames at the unit level; the visual smoke covers the live composition.
