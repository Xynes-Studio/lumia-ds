## Summary
<!-- One-paragraph description of what this PR does and why. -->

## Linked work
- Plan / issue: <!-- link -->
- Related repos: <!-- link any PRs that depend on or are depended on by this one -->

## Quality gates
- [ ] `lint` passes locally
- [ ] `test` passes locally
- [ ] Coverage ≥ ADR-001 80% floor (or justified exception below)
- [ ] `typecheck` / `build` passes (where applicable)
- [ ] Docs updated (`README.md`, `DEVELOPER.md`, `AGENTS.md`, repo memory)
- [ ] Migration added (if schema change) — forward-only, expand/contract
- [ ] QA PII scrub updated (if migration adds PII)
- [ ] Release doc set updated (if release contract changed)

## Security
- [ ] No secrets in code, logs, error messages, or test fixtures
- [ ] No raw API keys forwarded to downstream services
- [ ] No PII added to telemetry or access logs

## Deployment notes
<!-- e.g. "Requires migration run before service rollout", "Requires xynes-platform-contracts vX.Y.Z first". -->

## Rollback plan
<!-- For risky changes only. -->

---

## Repo-specific items (lumia-ds)

This is the **Lumia DS design-system monorepo** (pnpm workspace with `packages/*`). 13 packages: `cli`, `components`, `core`, `editor`, `editor-renderer`, `forms`, `icons`, `layout`, `marketing`, `next-mdx-import-source-file`, `runtime`, `theme`, `tokens`.

- [ ] Lint: `pnpm lint` (eslint over `packages/**/*.{ts,tsx,js,jsx}` --cache)
- [ ] Tests: `pnpm test` (`pnpm -r test` — runs every package's vitest suite)
- [ ] Coverage: `pnpm coverage:all` — runs coverage for components, editor, runtime, forms, layout, theme, tokens, icons. Each package MUST stay at or above the **ADR-001 80% lines + branches floor**.
- [ ] Type check: `pnpm type-check` (`tsc --build`) — workspace-wide project-references build
- [ ] Build: `pnpm build` (`pnpm -r build`) — every package's `tsup` (or equivalent) build MUST succeed cleanly. The component / editor / marketing dists are consumed via `pnpm link` by `xynes-auth-app` + `xynes-cms-console-web`.
- [ ] Visual regression: `pnpm test:visual` (Playwright Storybook smoke) when touching component-level visuals — re-run `pnpm test:visual:update` only when the visual change is intended.
- [ ] **MANDATORY package build before downstream consumer PRs.** Every consumer imports from package `dist/`. A consumer PR opened against a stale dist will fail in surprising ways. Run `pnpm --filter @lumia-ui/<pkg> build` before touching the consumer. The stale-dist trap is documented in repo memory as `lumia-ds-editor-dist-stale-trap-docker-dev-stack.md`.
- [ ] **Dashboard shell parity (AGENTS.md §7 rule 9 + BUG-LDS-1).** The `DashboardShell` primitive in `packages/layout/` is the canonical layout for every consumer (auth-app + cms-console-web). Any layout / shell-internals fix lands HERE first; app-level CSS overrides of shell internals (sidebar trigger, nav active selectors, scroll containment) are FORBIDDEN. The `h-dvh overflow-hidden` shell wrapper + the `overflow-y-auto` right-pane scroll frame are the BUG-LDS-1 contract.
- [ ] **Editor invariants (STORAGE-11 + STORAGE-LIVE-4 + BUG-LDS-6).** Image-block / video-block / file-block nodes ship optional `objectId?: string` payload + `MediaUploadResult.objectId?` + `EditorMediaConfig.resolveDownloadUrl?` plumbing. `ImageBlockComponent` re-mints fresh signed URLs via `resolveDownloadUrl(objectId)` on mount. Memo identity stability for the `mediaConfig` resolver function is mandatory (avoid inline literals in consumers — the `media` prop must be a stable reference).
- [ ] **Icon library compliance (UXR-3 + BUG-LDS-6 `no-inline-xynes-brand` rule).** Every icon in panel-block surfaces (toolbar Insert Panel button, slash-menu `/panel` item, panel header variant icon, popover icons) MUST consume `<Icon name="..." />` from `@lumia-ui/icons` only. The `no-inline-xynes-brand` ESLint rule + `scripts/audit-icon-sources.ts` enforce this — direct asset imports of `xynes-icon.svg` / `xynes-wordmark.svg` outside `packages/components/src/brand/` are rejected.
- [ ] **Frontend marketing primitives are vetted shapes (LP-DS).** Changes to `packages/marketing/` MUST preserve the security invariants (safe-URL guard, OSS link allowlist, mailto sanitisation, external-link `rel="noopener noreferrer"` + sr-only "(opens in new tab)" hint, mandatory alt text at the TS level, no tracking, `<a>` for CTAs not `<button>` wrapped in `<a>`, no inline brand SVG).
- [ ] **CI workflows already shipped.** This PR adds ONLY `pull_request_template.md` + `CODEOWNERS`. Do NOT modify the existing `.github/workflows/ci.yml` / `test.yml` / `visual-regression.yml` — that's a separate concern.
- [ ] No raw credentials in any package source, story, test fixture, or build script. No `xynes_live_*` / `AKIA*` / `re_*` / `phc_*` substrings anywhere — this repo publishes UI primitives, not credentials.
