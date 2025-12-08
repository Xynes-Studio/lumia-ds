# Slash Menu

The slash menu provides a Notion/Confluence-style quick insertion interface for adding blocks to the editor.

## Usage

1. Type `/` at the **start of a line** or **after whitespace**
2. A floating menu appears near the cursor
3. Type to filter (e.g., `/im` shows "Image")
4. Use **Arrow Up/Down** to navigate
5. Press **Enter** to insert the selected block
6. Press **ESC** to close without inserting

## Available Commands

| Command | Description | Keywords |
|---------|-------------|----------|
| `/image` | Insert an image from URL | image, picture, photo, media |
| `/video` | Embed video from YouTube/Vimeo/Loom | video, youtube, vimeo, loom, embed |
| `/file` | Attach a file | file, attachment, document, upload |
| `/table` | Insert a table | table, grid, rows, columns |
| `/panel` | Insert an info panel | panel, alert, info, note, warning, callout |
| `/status` | Insert a status pill | status, pill, tag, label, badge |

## BlockRegistry Integration

The slash menu is powered by the **BlockRegistry**. Each block definition can opt-in to the slash menu by setting `slashEnabled: true`:

```typescript
// In blocks/registry.ts
image: {
  type: 'image',
  label: 'Image',
  icon: Image,
  nodeClass: ImageBlockNode,
  description: 'Insert an image from URL',
  keywords: ['image', 'picture', 'photo', 'media'],
  slashEnabled: true,  // Enables this block in slash menu
}
```

### Adding Custom Slash Commands

1. Add a new block definition to `CORE_BLOCKS` in `registry.ts`
2. Set `slashEnabled: true`
3. Add an executor function in `slashCommands.ts`:

```typescript
const slashCommandExecutors: Record<string, (editor: LexicalEditor) => void> = {
  // ... existing executors
  myCustomBlock: (editor: LexicalEditor) => {
    editor.dispatchCommand(INSERT_CUSTOM_BLOCK_COMMAND, {
      // payload
    });
  },
};
```

## API Reference

### `filterSlashCommands(commands, query)`

Filters slash commands based on a search query. Matches against:
- Command name
- Display label
- Keywords

### `getSlashCommandBlocks()`

Returns all block definitions with `slashEnabled: true` from the BlockRegistry.

### `createSlashCommandFromRegistry(blockType, execute, overrides?)`

Creates a `SlashCommand` object from a block definition. Useful for extending or customizing commands.

## Trigger Conditions

The slash menu only opens when:
- `/` is typed at the **start of a paragraph**
- `/` is typed **after whitespace** (e.g., space, newline)

It does **NOT** open when:
- `/` is typed in the middle of text (e.g., "path/to/file")
- There is already an open menu

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `↓` Arrow Down | Move to next item |
| `↑` Arrow Up | Move to previous item |
| `Enter` | Insert selected block |
| `Escape` | Close menu |

## Accessibility

- The menu has `role="listbox"` with proper ARIA labels
- Each item has `role="option"` with `aria-selected` state
- Full keyboard navigation support
