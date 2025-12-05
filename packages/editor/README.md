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

### Font Configuration

Control which fonts are available in your editor using the `fonts` prop:

```tsx
import { LumiaEditor, type FontConfig } from '@lumia/editor';

function AppWithCustomFonts() {
  const [value, setValue] = useState(null);
  
  // Define custom font configuration
  const customFonts: FontConfig = {
    allFonts: [
      {
        id: 'arial',
        label: 'Arial',
        cssStack: 'Arial, sans-serif',
      },
      {
        id: 'georgia',
        label: 'Georgia',
        cssStack: 'Georgia, serif',
      },
    ],
    allowedFonts: ['arial'], // Optional: restrict to specific fonts
    defaultFontId: 'arial',
  };
  
  return (
    <LumiaEditor 
      value={value} 
      onChange={setValue}
      fonts={customFonts} 
    />
  );
}
```

**Default Fonts**: When no `fonts` prop is provided, the editor uses a curated set of Google Fonts:
- **Inter** (sans-serif, default)
- **Roboto** (sans-serif)
- **Lora** (serif)
- **Roboto Mono** (monospace)
- **Playfair Display** (serif)

All fonts include proper fallback stacks following Google Fonts best practices.

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

## API Reference

### Font Configuration

#### `FontConfig`

Type definition for font configuration:

```typescript
interface FontConfig {
  allFonts: FontMeta[];        // All available fonts
  allowedFonts?: string[];     // Optional: subset of allowed font IDs
  defaultFontId: string;       // Default font ID (must exist in allFonts)
}
```

#### `FontMeta`

Type definition for individual font metadata:

```typescript
interface FontMeta {
  id: string;         // Unique identifier (e.g., "inter")
  label: string;      // Display label (e.g., "Inter")
  cssStack: string;   // CSS font-family with fallbacks
}
```

#### `getDefaultFontConfig()`

Returns the default font configuration with curated Google Fonts.

```typescript
import { getDefaultFontConfig } from '@lumia/editor';

const defaultFonts = getDefaultFontConfig();
// Returns: FontConfig with Inter, Roboto, Lora, Roboto Mono, Playfair Display
```

#### `useFontsConfig()`

Hook to access the current font configuration. Must be used within `EditorProvider`.

```typescript
import { useFontsConfig } from '@lumia/editor';

function MyComponent() {
  const fontsConfig = useFontsConfig();
  
  return (
    <select>
      {fontsConfig.allFonts.map(font => (
        <option key={font.id} value={font.id}>
          {font.label}
        </option>
      ))}
    </select>
  );
}
```

## Development

To view the editor components in Storybook:

```bash
pnpm storybook
```
