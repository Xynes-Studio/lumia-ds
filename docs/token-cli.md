# Token CLI Commands

The `@lumia/cli` package includes commands to manage design tokens within the Lumia Design System.

## Commands

### `lumia tokens build`

Builds the design tokens using Style Dictionary.

**Usage:**
```bash
lumia tokens build
```

**Behavior:**
- Looks for `pnpm build:tokens` script in the current `package.json`.
- Executes the script.
- Generally transforms JSON tokens in `tokens/` to outputs in `src/generated` and `dist/`.

### `lumia tokens validate`

Validates design token JSON files for consistency and correctness.

**Usage:**
```bash
lumia tokens validate [directory]
```
*   `[directory]`: Optional. Defaults to `tokens`.

**Validation Rules:**
1.  **Duplicate Names**: Ensures that no two tokens result in the same path name (concatenated keys), even across different files.
2.  **Missing Types**: Ensures every leaf node (node with a `value`) has a `type` property (e.g., `color`, `dimension`).
3.  **JSON Syntax**: Ensures all files are valid JSON.

## Development

The commands are implemented in `packages/cli/src/commands/tokens`.

- `build.ts`: Handles the build process via child process.
- `validate.ts`: Implements the recursive validation logic.
