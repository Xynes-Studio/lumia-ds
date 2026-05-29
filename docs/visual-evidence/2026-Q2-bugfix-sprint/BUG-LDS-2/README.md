# BUG-LDS-2 — Workspace switcher parity (visual evidence)

Single canonical workspace switcher: Lumia DS `DashboardWorkspaceSwitcher` is
the only in-shell switcher for every `DashboardShell` consumer (Auth App + CMS
Console). The legacy `xynes-auth-app` `WorkspaceSwitcher.tsx` is retained for
standalone (non-shell) callers only.

## Trigger layout contract

- Trigger fills the rail width (`w-full`); width governed by the shell's
  `--dashboard-sidebar-width` token, not app CSS.
- Expanded rail: single grid `grid-cols-[auto_1fr_auto]` — avatar (left) /
  label stack (`1fr`) / chevron (right). No inline padding hacks.
- Compact rail: label **and** chevron hidden; avatar only.

## Captures

| File | Source | What it shows |
|---|---|---|
| `workspace-switcher-expanded-900.png` | `Runtime/DashboardShell → BasicDashboardShell`, 1440×900, Chromium | Expanded trigger filling the rail: avatar + label left-anchored, chevron right-anchored. |

Captured by the runtime spec `e2e/dashboard-workspace-switcher-parity.spec.ts`,
which asserts (at real layout) `display: grid`, three template columns, full
rail width, and a right-anchored chevron. Chromium is exercised in this
environment; Firefox/WebKit projects require `pnpm exec playwright install`.

## Operator follow-up (full-stack parity, deferred per sprint plan §7)

Bring up `xynes-front-end/infra/run.sh up:dev` and confirm the **DOM parity**
between `auth-app:/dashboard` and `cms-console:/dashboard/<slug>`: both render
`[data-testid="dashboard-workspace-trigger"]` with the same
`[data-testid="dashboard-workspace-trigger-grid"]` structure. Capture one PNG
per app at 1440×900 plus an `en-XA` pseudo-locale capture to stress long
labels (truncation must hold, chevron must stay right-anchored).
