# StatusNode (ED-218)

Inline status lozenge for displaying status labels within paragraph text, similar to Confluence Status macro.

## Export
- `StatusNode`, `$createStatusNode`, `$isStatusNode`, `StatusColor`, `StatusPayload`, `SerializedStatusNode` from `@lumia/editor` (via internal nodes).

## Attributes
- `text: string` – the status text to display.
- `color: 'success' | 'warning' | 'error' | 'info'` – semantic color variant.

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
