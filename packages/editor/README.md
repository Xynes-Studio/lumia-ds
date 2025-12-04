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

## Components

### `LumiaEditor`

The main editor component.

```tsx
import { LumiaEditor } from '@lumia/editor';

<LumiaEditor
  value={doc}
  onChange={(newDoc) => setDoc(newDoc)}
  variant="full" // or "compact"
  mode="document" // or "inline"
  readOnly={false}
/>
```

#### Props

- `value`: The current `DocNode` JSON document.
- `onChange`: Callback fired when the document changes.
- `variant`: `'full' | 'compact'` - Determines the toolbar layout (full shows all options, compact shows minimal options).
- `mode`: `'document' | 'inline'` - Editor behavior mode (default: `'document'`).
  - `'document'`: Full editor with toolbar and text area.
  - `'inline'`: Inline editing mode - renders as typography when not focused, edits inline on click with minimal toolbar.
- `fonts`: `FontConfig` - Optional font configuration to control available fonts (see Font Configuration section below).
- `readOnly`: `boolean` - Whether the editor is read-only.
- `className`: `string` - Optional class name.

#### Mode Examples

**Document mode (default):**
```tsx
<LumiaEditor 
  value={doc} 
  onChange={handleChange}
  variant="full"
/>
// Shows full editor with toolbar
```

**Inline mode:**
```tsx
<LumiaEditor 
  value={doc} 
  onChange={handleChange}
  mode="inline"
/>
// Renders as text, switches to editor on click/focus
```

### `LumiaInlineEditor`

A wrapper component for inline editing of text blocks (e.g. titles, labels).

```tsx
import { LumiaInlineEditor } from '@lumia/editor';

<LumiaInlineEditor
  value={doc}
  onChange={(newDoc) => setDoc(newDoc)}
  placeholder="Click to edit..."
/>
```

#### Props

- `value`: The current `DocNode` JSON document.
- `onChange`: Callback fired when the document changes.
- `placeholder`: `string` - Text to show when empty (default: "Click to edit...").
- `className`: `string` - Optional class name.

## Font Configuration

The editor supports configurable font controls to enforce brand fonts or limit font choices.

### FontConfig Type

```typescript
interface FontMeta {
  id: string;
  label: string;
  category?: 'serif' | 'sans' | 'mono';
}

interface FontConfig {
  allFonts: FontMeta[];          // Full set of available fonts
  allowedFonts?: string[];       // Optional whitelist of font IDs
  defaultFontId: string;         // Default font when none is set
}
```

### Default Configuration

The editor ships with a curated default font set:

```typescript
import { DEFAULT_FONT_CONFIG } from '@lumia/editor';

// Includes: Inter, Roboto, Open Sans, Montserrat, Lora, Merriweather, 
//           Roboto Mono, Source Code Pro
```

### Usage Examples

**Using default fonts:**
```tsx
<LumiaEditor 
  value={doc} 
  onChange={handleChange}
  variant="full"
/>
// Font selector shows all default fonts (Inter, Roboto, etc.)
```

**Limiting to brand fonts:**
```tsx
const brandFonts: FontConfig = {
  allFonts: DEFAULT_FONT_CONFIG.allFonts,
  allowedFonts: ['inter', 'roboto'],  // Only allow these fonts
  defaultFontId: 'inter',
};

<LumiaEditor 
  value={doc} 
  onChange={handleChange}
  variant="full"
  fonts={brandFonts}
/>
// Font selector shows only Inter and Roboto
```

**Custom font set:**
```tsx
const customFonts: FontConfig = {
  allFonts: [
    { id: 'brand-sans', label: 'Brand Sans', category: 'sans' },
    { id: 'brand-serif', label: 'Brand Serif', category: 'serif' },
  ],
  defaultFontId: 'brand-sans',
};

<LumiaEditor 
  value={doc} 
  onChange={handleChange}
  fonts={customFonts}
/>
```

### Font Application

Fonts are applied as block-level attributes (`attrs.fontId`) on paragraph, heading, and list_item nodes:

```typescript
const docWithFont: Doc = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      attrs: { fontId: 'roboto' },  // Font applied here
      content: [{ type: 'text', text: 'Hello World' }],
    },
  ],
};
```

### Font Normalization

Invalid or disallowed fonts are automatically normalized to `defaultFontId`:
- Font ID not in `allFonts` → `defaultFontId`
- Font ID not in `allowedFonts` → `defaultFontId`
- No font ID specified → `defaultFontId`
