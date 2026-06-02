# Editor icon policy

**Status:** Active. Last updated 2026-06-02 (BUG-LDS-6).

## Rule

Every icon rendered by the `@lumia-ui/editor` package MUST come from the Lumia icon library (`@lumia-ui/icons`), via the `<Icon name="..." />` component. Direct icon-component imports from `lucide-react` (or any other icon library) are forbidden inside the guarded panel-block surfaces.

This codifies the UXR-3 icon-purpose registry contract for the editor surface.

## Why

- **Visual consistency.** Lucide and Lumia icons have different stroke weights, metrics, and optical alignment. Mixing them inside the same editor toolbar / inspector / panel header creates a visibly inconsistent UI that authors notice immediately (the original symptom that filed BUG-LDS-6).
- **Single source of truth.** The Lumia icon registry maps semantic IDs (`info`, `alert`, `circle-check`, `file-text`, etc.) to the chosen visual representation. Apps and design tokens can swap the underlying SVGs in one place without touching every consumer.
- **Sprite optimization.** Icons in the Lumia sprite pool render via `<svg><use href="#icon-<id>" /></svg>` which is significantly cheaper than instantiating a fresh lucide React component per icon, especially in editor surfaces with hot re-render paths.

## Enforcement

A static drift-detection script audits a closed list of panel-block source files for `from 'lucide-react'` imports:

```bash
pnpm --filter @lumia-ui/editor audit:icons
```

The script lives at `packages/editor/scripts/audit-icon-sources.ts`. Its `GUARDED_FILES` constant lists every panel-block surface it patrols. When you extend the panel-block surface (new component, new test file), add the file to the list.

The audit exits 1 on violation with a per-file diff showing the offending import line. Add the script to CI / pre-commit if you want hard enforcement.

> **Prerequisite:** the script runs under [Bun](https://bun.sh) (`#!/usr/bin/env bun` shebang + `bun scripts/audit-icon-sources.ts` invocation). Bun is already a workspace-wide prerequisite for backend services per `AGENTS.md` §7 rule 8 — `brew install oven-sh/bun/bun` if you don't have it. CI inherits the workspace Bun toolchain.

## Available icon IDs for the panel surface

Defined in `packages/icons/src/default-icons.ts` (seed) and consumed by `packages/editor/src/utils/panelActionUtils.ts`:

| Panel variant | Lumia icon ID  | Lucide source                  |
| ------------- | -------------- | ------------------------------ |
| `info`        | `info`         | `Info`                         |
| `warning`     | `alert`        | `AlertTriangle`                |
| `success`     | `circle-check` | `CheckCircle2`                 |
| `note`        | `file-text`    | `FileText`                     |

Toolbar **Insert Panel** button uses `layout-grid` (`LayoutGrid`).

If you need a new icon, add it to `packages/icons/src/default-icons.ts` first (register a stable string ID), then use it via `<Icon name="..." />` in the editor surface.

## Out of scope

This policy currently guards only the **panel-block** surface (per BUG-LDS-6 §3.1). The broader editor migration (toolbar formatting buttons, slash-menu icons, file / image / video / table block surfaces) is tracked separately — UXR-3 for the icon-purpose registry sweep, and follow-up tickets per surface as they're refactored.

The audit script's `GUARDED_FILES` list is the source of truth for what's currently enforced. Do not silently extend the list to cover new surfaces without coordinating with the surface's owner.
