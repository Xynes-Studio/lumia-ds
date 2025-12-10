# StatusNode (ED-218 & ED-219)

Inline status lozenge for displaying status labels within paragraph text, similar to Confluence Status macro.

## Export
- `StatusNode`, `$createStatusNode`, `$isStatusNode`, `StatusColor`, `StatusPayload`, `SerializedStatusNode` from `@lumia/editor` (via internal nodes).

## Attributes
- `text: string` – the status text to display.
- `color: 'success' | 'warning' | 'error' | 'info'` – semantic color variant.

## Quick Insert via Slash Command (ED-219)

Type `/status` in the editor to insert a status pill:

1. In an empty paragraph, type `/status`
2. Select "Status" from the slash menu
3. A default "Status" pill with `info` color is inserted

## Editing via Popover (ED-219)

Click on any status pill to open the editing popover:

- **Text Input**: Edit the label text (debounced 300ms updates)
- **Color Swatches**: Click to instantly change color (success, warning, error, info)

### Programmatic Updates
```tsx
editor.update(() => {
  const node = $getNodeByKey(nodeKey);
  if ($isStatusNode(node)) {
    node.setText('Updated');
    node.setColor('success');
  }
});
```

## Usage

The StatusNode is an inline DecoratorNode that renders using the Lumia `StatusPill` component.

### Creating via JSON
```tsx
const editorState = {
  root: {
    children: [
      {
        type: 'paragraph',
        children: [
          { type: 'text', text: 'Task is ' },
          { type: 'status', text: 'In Progress', color: 'info', version: 1 },
          { type: 'text', text: ' and needs review.' },
        ],
      },
    ],
  },
};
```

### Programmatic Creation
```tsx
import { $createStatusNode } from '@lumia/editor';

editor.update(() => {
  const statusNode = $createStatusNode({
    text: 'Done',
    color: 'success',
  });
  // Insert into paragraph...
});
```

### Via Command
```tsx
import { INSERT_STATUS_COMMAND } from '@lumia/editor';

editor.dispatchCommand(INSERT_STATUS_COMMAND, {
  text: 'In Progress',
  color: 'info',
});
```

## Serialization
```json
{
  "type": "status",
  "text": "In Progress",
  "color": "info",
  "version": 1
}
```

## Notes
- StatusNode is **inline** (`isInline()` returns `true`), allowing it to be placed within paragraph text.
- Uses Lumia's `StatusPill` component for consistent styling.
- Registered in the editor's block registry under type `'status'`.
- Popover uses Lumia `Popover`, `PopoverContent`, `PopoverTrigger`, and `Input` components.

