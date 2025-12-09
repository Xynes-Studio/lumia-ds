# @lumia/cli

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
