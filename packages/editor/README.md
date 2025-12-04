# @lumia/editor

This package contains the core editor logic and value model for the Lumia Design System editor.

## Installation

```bash
pnpm add @lumia/editor
```

## Usage

This package exports the `DocNode` and `Mark` types which define the schema for the editor's JSON document model.

```typescript
import { DocNode, Doc } from '@lumia/editor';

const doc: Doc = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Hello World',
        },
      ],
    },
  ],
};
```

## Schema

The schema supports the following nodes:
- `doc`
- `paragraph`
- `heading`
- `bullet_list`
- `ordered_list`
- `list_item`
- `image`
- `link`
- `code_block`
- `text`

And the following marks:
- `bold`
- `italic`
- `underline`
- `code`
- `link`

## Transforms

The package exports functions to convert between the `DocNode` JSON tree and ProseMirror `EditorState`.

### `editorStateToJson(editorState: EditorState): DocNode`

Converts a ProseMirror `EditorState` to a `DocNode` JSON tree.

```typescript
import { editorStateToJson } from '@lumia/editor';

const json = editorStateToJson(editorState);
```

### `jsonToEditorState(json: DocNode): EditorState`

Converts a `DocNode` JSON tree to a ProseMirror `EditorState`.

```typescript
import { jsonToEditorState } from '@lumia/editor';

const editorState = jsonToEditorState(json);
```
