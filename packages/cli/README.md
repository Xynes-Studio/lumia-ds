# @lumia-ui/cli

> CLI utilities for Lumia Design System

## Usage

This package provides the `lumia` command-line tool.

### Development

Run from monorepo root:

```bash
pnpm lumia [command]
```

### Commands

- `lumia --help`: Show help
- `lumia version`: Show version
- `lumia generate`: Generator commands
- `lumia tokens build`: Build tokens (runs Style Dictionary)
- `lumia tokens validate`: Validate token JSON integrity

## Architecture

Built with [Commander.js](https://github.com/tj/commander.js).

## Testing

```bash
pnpm test
pnpm test -- --coverage
```

## Safe SVG import (XYN-SEC-004)

From the monorepo root:

```bash
node packages/cli/bin/lumia-icon-import.js <svg-source-folder> [icons-package-root]
# Or use the configured root script for packages/icons/raw:
pnpm icons:import
```

Paths are resolved against the current working directory. Output remains
`<icons-package-root>/src/generated/icons/*.tsx`, plus generated index and registry
files. Supported static icons retain their component names, registration IDs and
React SVG props. Filenames may contain ASCII letters/numbers, spaces, underscores
and hyphens; duplicate generated names or IDs fail validation. Numeric names get an
`Icon` prefix so the generated identifier is valid TypeScript.

The importer parses XML and accepts static geometry (`path`, `rect`, `circle`,
`ellipse`, `line`, `polyline`, `polygon`), groups, titles/descriptions, definitions,
gradients/stops, clipping and masks. Paint may be a static color or an exact
`url(#local-id)` fragment. SVG attributes are allowlisted, including standard
geometry/presentation and accessible labels. Generated components use JSX and
escaped string values; SVG input never enters a raw HTML sink.

Scripts, event handlers, styles/inline CSS, animation, links/images/use, foreign
content, DTDs, processing instructions, arbitrary namespaces, external URLs and
`${...}` interpolation (including entity-encoded forms) are rejected. Unsupported
artwork must be simplified and reviewed; there is no unsafe bypass flag. Bounds:
1 MiB per file, 4,096 elements, depth 32, 64 attributes per element, 16 KiB per
attribute value, 256 files and 16 MiB per batch. Only regular files are accepted;
symlinks and invalid UTF-8 fail. No external resources are fetched.

The full batch is validated and rendered before existing generated files are
replaced. Validation errors leave prior components, index and registry intact.
Only old `.tsx` files in the generated components directory are removed. A
filesystem write failure can still leave partial output; fix the underlying error
and rerun the command.

The separate icons package `build:icons` command uses SVGR and does **not** use this
validator. Keep that source pipeline restricted to reviewed trusted assets until
XYN-SEC-004-FU-1 applies the same policy. See [the workflow](../../docs/icon-import.md).

No environment variables or database migration are needed. Re-import previously
generated CLI assets using the hardened command and rebuild the consuming package.
A source rollback restores the vulnerable importer; retain the rejection policy
and fix unsupported assets rather than restoring unsafe generation.

Security checks:

```bash
pnpm --filter @lumia-ui/cli test       # includes coverage, minimum 80%
pnpm --filter @lumia-ui/cli type-check # TypeScript + checked importer JavaScript
pnpm lint
pnpm --filter @lumia-ui/cli build
```
