# @lumia/editor

The core editor package for Lumia DS, built on top of [Lexical](https://lexical.dev/).

## Installation

```bash
pnpm add @lumia/editor
```

## Features

- **Rich Text**: Paragraphs, Headings (H1-H3), Lists (Bullet, Numbered), Quotes, Code Blocks.
- **Text Formatting**: Bold, Italic, Underline, Inline Code (with keyboard shortcuts), Links (Cmd+K, Smart Paste).
- **History**: Undo/Redo support.
- **JSON Input/Output**: Fully serializable editor state.

## Usage

```tsx
import { LumiaEditor } from '@lumia/editor';

function App() {
  const [value, setValue] = useState(null);
  
  return (
    <LumiaEditor 
      value={value} 
      onChange={setValue} 
    />
  );
}
```

### Advanced Usage

You can access the editor state in child components using `useEditorState` hook. Note that `LumiaEditor` already wraps its children in `EditorProvider`.

```tsx
import { LumiaEditor, useEditorState } from '@lumia/editor';

const WordCount = () => {
  const { json } = useEditorState();
  // ... calculate word count from json
  return <div>Words: ...</div>;
};

// ... inside LumiaEditor (if we expose children prop later) or if you use EditorProvider directly
```

Or use `EditorProvider` directly for custom layouts:

```tsx
import { EditorProvider, useEditorState } from '@lumia/editor';
import { LumiaEditorPrimitive } from '@lumia/editor/internal/LumiaEditorPrimitive'; // Note: internal import

function CustomEditor() {
  return (
    <EditorProvider>
      <LumiaEditorPrimitive />
      <MyCustomToolbar />
    </EditorProvider>
  );
}
```

## Development

To view the editor components in Storybook:

```bash
pnpm storybook
```
