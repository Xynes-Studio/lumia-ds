# Lumia CLI

The Lumia CLI (`@lumia/cli`) is the unified command-line interface for the Lumia Design System. It provides a central entry point for all development workflows, including scaffolding resources, managing icons, and more.

## Installation

The CLI is included for development within the monorepo.

To run the CLI from the root of the repo:

```bash
pnpm lumia --help
```

## Usage

### Global Commands

#### `version`
Prints the current version of the CLI.

```bash
pnpm lumia version
# OR
pnpm lumia --version
```

#### `help`
Displays help information for commands.

```bash
pnpm lumia --help
```


### Generator Commands

#### `generate component <Name>`
Scaffolds a new React component with consistent folder structure.

**Usage:**
```bash
lumia generate component Button
```

**Prompts:**
- **Package**: Which package does this component belong to? (e.g. `@lumia/ui`)
- **Features**: Select files to generate (Storybook Story, Test File, Style File).

**Output Structure:**
```
packages/<pkg>/src/components/<Name>/
├── <Name>.tsx
├── <Name>.stories.tsx
├── <Name>.test.tsx
└── <Name>.css
```

## Architecture

The CLI is built using **Commander.js** and follows a standard subcommand pattern.

- **Entry Point**: `packages/cli/bin/lumia.js`
- **Source**: `packages/cli/src/index.ts`
- **Build**: Uses `tsup` to bundle for Node.js (CJS/ESM).

### Directory Structure

```
packages/cli/
├── bin/
│   ├── lumia.js           # Main entry point
│   ├── lumia-icon-import.js # Legacy script (to be migrated)
│   └── lumia-resource.js    # Legacy script (to be migrated)
├── src/
│   ├── __tests__/         # Tests
│   └── index.ts           # Main application logic
├── dist/                  # Built artifacts
├── package.json
└── tsconfig.json
```

## Adding New Commands

To add a new command to the CLI:

1.  Open `packages/cli/src/index.ts`.
2.  Use the `commander` API to define the command.
3.  Implement the command logic (preferably in a separate file if complex).
4.  Add tests in `packages/cli/src/__tests__`.

Example:

```typescript
// src/index.ts
program
  .command('greet <name>')
  .description('Greet a user')
  .action((name) => {
    console.log(`Hello, ${name}!`);
  });
```

## Testing

We follow TDD principles with a strict **75% coverage requirement**.

Run tests:
```bash
pnpm --filter @lumia/cli test
```

Check coverage:
```bash
pnpm --filter @lumia/cli test -- --coverage
```
