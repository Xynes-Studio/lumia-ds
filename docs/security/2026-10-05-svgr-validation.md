# SEC-004-FU-1 — SVG pipeline implementation and review, 2026-10-05

Verdict: implementation and local pre-PR review passed on `feature/security-audit-remaining-high-medium`. Not published or merged.

## Implementation and acceptance

The existing strict SAX/XML parser now runs as the first SVGR config plugin, before SVGO/JSX. The documented build snapshots and validates every source file, checks filename collisions and physical source/output separation, generates in an isolated directory, writes complete exports/registrations and then replaces output. A failed batch does not overwrite prior output. Rename failure restores the prior batch; if rollback also fails, the backup is retained for recovery. The direct index script delegates to the same build. Direct config use validates each input; whole-batch replacement belongs to the documented build command.

Reused policy rejects active elements, event/URL attributes, DTD/entity declarations, unsupported namespaces, interpolation and malformed/oversized XML. File reads retain regular-file, no-follow, fatal UTF-8, byte/batch/node/depth limits. No new dependencies or lockfile changes. CLI policy now returns its validated source snapshot as an additive field. Runtime packages do not import build tooling.

Eight real direct-config negative probes failed before the fix and passed after. Real `pnpm build:icons` tests cover the same unsafe inputs in a mixed batch and prove exact previous-output preservation. Other regressions cover static corpus, original exports/registrations, generated-module evaluation and React rendering, collisions, symlink/size boundaries, source/output aliases and failure recovery.

Reviewer inspected requirements, complete diff, generated outputs, parser reuse, entry points, types, subprocess/file handling, rollback and docs. Required review fix: resolve physical paths before source/output separation checks so symlinked ancestors cannot cause replacement of source data. Targeted test/coverage, typecheck, lint and icon build passed again after that fix. No required findings remain.

## Validation

Using pinned pnpm 10.23.0:

- `corepack pnpm --workspace-concurrency=1 -r test`: all eleven package suites passed: CLI 89, icons 95, tokens 20, components 309, theme 8, editor 1190 (+2 skips), editor-renderer 3, forms 19, layout 53, marketing 112, runtime 108.
- `corepack pnpm coverage:all`: configured monorepo sweep passed. Icons overall statements/lines 92.66%, functions 92.59%, branches 92.92%; configured 80% gates unchanged. CLI statements/lines 84.48%, functions 100%, branches 82.73%; shared parser statements/lines 95.69%, functions 100%, branches 81.87%.
- Final affected icons coverage after reviewer fix: 95 tests passed; changed build script, validation plugin, config and direct-entry adapter have 100% statement/line and function coverage where functions exist. Build orchestration branch coverage is above 80%. The adapter's process-main branch runs in a real subprocess and is not counted by parent V8 branch instrumentation; no fabricated per-file branch coverage claim.
- Root `corepack pnpm type-check` and `corepack pnpm lint` passed. New `tsconfig.svgr.json` checks JavaScript tooling with strict checkJs; compiler/lint settings were not relaxed.
- `corepack pnpm --filter './packages/**' -r build`, icon/CLI builds and `STORYBOOK_DISABLE_TELEMETRY=1 corepack pnpm storybook:build` passed. Icon build repeated after the reviewer fix.
- All seven committed generated icon files are byte-identical to develop, including the five components and public index/registry. All 15 pre-existing docs `.next` files retain their initial hashes. They are excluded from commits. Full docs-app Next build is outside this build-only change and was not run over that existing work.

Baselines: icons suite/coverage, root lint/typecheck and icon build passed before implementation. Initial Corepack startup failed because its bundled npm signing keys were stale; current npm registry public keys enabled normal signature verification of pinned pnpm, without disabling integrity checks. Initial overlapping coverage commands raced on shared temporary files; final gates above were rerun without overlapping package coverage jobs and passed. Logs: `/private/tmp/xynes-security-goal/lumia-*`.

No database, backend deployment, provider or live browser changes. React render tests prove generated artifact behavior. Updated import workflow and icons README document limits, direct-entry semantics and recovery. Rebuild consumer distributions after the eventual authorized merge. Rollback requires reverting tooling, not introducing unsafe SVG validation bypasses.
