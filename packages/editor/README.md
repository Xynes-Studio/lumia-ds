# @lumia/editor

The core editor package for Lumia DS, built on top of [Lexical](https://lexical.dev/).

## Installation

```bash
pnpm add @lumia/editor
```

## Features

- **Rich Text**: Paragraphs, Headings (H1-H3), Lists (Bullet, Numbered), Quotes, Code Blocks, Images (Upload & URL).
- **Text Formatting**: Bold, Italic, Underline, Inline Code (with keyboard shortcuts), Links (Cmd+K, Smart Paste).
- **History**: Undo/Redo support.
- **Inline Editor**: Dedicated component for titles and single-line text with bubble toolbar.
- **JSON Input/Output**: Fully serializable editor state.
- **Accessibility**: ARIA-compliant toolbar, buttons, and inputs. Tested with `jest-axe`.

## Usage

```tsx
import { LumiaEditor, LumiaInlineEditor } from '@lumia/editor';

function App() {
  const [value, setValue] = useState(null);
  const [title, setTitle] = useState(null);
  
  return (
    <div className="space-y-4">
      {/* Inline Editor for titles */}
      <LumiaInlineEditor
        value={title}
        onChange={setTitle}
        placeholder="Enter title..."
        className="text-3xl font-bold"
      />

      {/* Main Editor for content */}
      <LumiaEditor 
        value={value} 
        onChange={setValue} 
        variant="full" 
      />
    </div>
  );
}
```

### Toolbar Variants

The editor supports two toolbar variants:

- **Full** (`variant="full"`): The default toolbar with all features including block type dropdown, font picker, text formatting, lists, and links.
- **Compact** (`variant="compact"`): A simplified toolbar for tight layouts, showing only essential formatting options (Bold, Italic, Underline, Bullet List, Link).

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

#### Brand Font Restrictions

Use `allowedFonts` to restrict font selection to specific brand fonts. The editor will:
- Only show allowed fonts in the font picker
- Automatically normalize `defaultFontId` to the first allowed font if it's not in the allowed list
- Ignore attempts to select disallowed fonts

```tsx
const brandFonts: FontConfig = {
  allFonts: [
    { id: 'inter', label: 'Inter', cssStack: 'Inter, sans-serif' },
    { id: 'roboto', label: 'Roboto', cssStack: 'Roboto, sans-serif' },
    { id: 'lora', label: 'Lora', cssStack: 'Lora, serif' },
  ],
  allowedFonts: ['inter', 'roboto'], // Only Inter and Roboto allowed
  defaultFontId: 'lora', // Will be auto-normalized to 'inter'
};

// The editor will use 'inter' as default (first in allowedFonts)
// Only Inter and Roboto will appear in the font picker
```

**Auto-Normalization**: If `defaultFontId` is not in `allowedFonts`, the editor automatically uses the first font in `allowedFonts` as the default. This ensures brand compliance without requiring manual configuration updates.

### Media Configuration

Configure media upload behavior (for images and files) using the `media` prop:

```tsx
import { LumiaEditor, type EditorMediaConfig } from '@lumia/editor';

const mediaConfig: EditorMediaConfig = {
  // Optional: Custom upload adapter
  uploadAdapter: {
    uploadFile: async (file) => {
      // Upload file to your backend
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      return {
        url: data.url,
        mime: data.mime,
        size: data.size,
      };
    },
  },
  // Optional: Restrict allowed types
  allowedImageTypes: ['image/jpeg', 'image/png'],
  maxFileSizeMB: 10,
};

function App() {
  return (
    <LumiaEditor
      media={mediaConfig}
      // ... other props
    />
  );
}
```

If no `uploadAdapter` is provided, upload features will be gracefully disabled.


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

#### `normalizeFontConfig()`

Normalizes a font configuration to enforce brand restrictions. Automatically maps `defaultFontId` to the first allowed font if it's not in the `allowedFonts` list.

```typescript
import { normalizeFontConfig, type FontConfig } from '@lumia/editor';

const config: FontConfig = {
  allFonts: [/* ... */],
  allowedFonts: ['inter', 'roboto'],
  defaultFontId: 'lora', // Not in allowedFonts
};

const normalized = normalizeFontConfig(config);
// normalized.defaultFontId === 'inter' (first in allowedFonts)
```

**Note**: The editor automatically normalizes font configurations on initialization. You typically don't need to call this function directly unless you're building custom font configuration logic.

### Block Registry

The editor includes a block registry system to manage different block types (e.g., paragraph, heading, image, video).

#### `BlockType`

Union type of all available block types:

```typescript
type BlockType = 
  | 'paragraph' 
  | 'heading' 
  | 'image' 
  | 'video' 
  | 'file' 
  | 'table' 
  | 'panel' 
  | 'status' 
  | 'code';
```

#### `blockRegistry`

A Map containing definitions for all registered blocks. You can retrieve block definitions using `getBlockDefinition(type)`.

```typescript
import { getBlockDefinition } from '@lumia/editor/blocks';

const imageBlock = getBlockDefinition('image');
// Returns BlockDefinition for 'image'
```

### Image Block

The editor supports image blocks with optional captions and selection styling.

```tsx
import { $createImageBlockNode } from '@lumia/editor/nodes/ImageBlockNode';

// Programmatic insertion
editor.update(() => {
  const node = $createImageBlockNode({
    src: 'https://example.com/image.jpg',
    alt: 'Alt text',
    caption: 'Optional caption',
    width: 500,
    height: 300,
  });
  $insertNodes([node]);
});

### Image Block
- **Insert Image**: Use the toolbar button to insert an image from a URL. If an `uploadAdapter` is configured, inserting an image block without a URL will display an upload UI, allowing users to select a file from their device.
- **Layouts**: Click on an image to see the layout toolbar.
    - **Inline**: Default layout, respects width percentage.
    - **Breakout**: Wider than the text column.
    - **Full Width**: Spans the entire editor width (100%).
- **Resizing**: Use the percentage buttons (25%, 50%, 75%, 100%) in the overlay toolbar to resize the image.


### File Block
The editor supports file attachments with a card UI.

```tsx
import { $createFileBlockNode } from '@lumia/editor/nodes/FileBlockNode';

// Programmatic insertion
editor.update(() => {
  const node = $createFileBlockNode({
    url: 'https://example.com/document.pdf',
    filename: 'document.pdf',
    size: 1024 * 1024, // 1MB
    mime: 'application/pdf',
  });
  $insertNodes([node]);
});
```

- **Insert File**: Use the toolbar button to insert a file. If an `uploadAdapter` is configured, selecting a file will trigger the upload flow, showing an optimistic preview and progress state.


### Video Block
The editor supports embedded videos from YouTube, Vimeo, Loom, and HTML5 video files.

```tsx
import { $createVideoBlockNode } from '@lumia/editor/nodes/VideoBlockNode';

// Programmatic insertion
editor.update(() => {
  const node = $createVideoBlockNode({
    src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    provider: 'youtube',
    title: 'Rick Roll',
  });
  $insertNodes([node]);
});
```

- **Supported Providers**: 'youtube', 'vimeo', 'loom', 'html5'.
- **Rendering**: Renders as an `iframe` for embed providers and `<video>` tag for HTML5.



## Performance Testing

The editor includes a "Large Document" story for performance testing. This story pre-seeds the editor with a large JSON payload (50+ paragraphs, headings, lists) to verify rendering performance and typing latency.

To run the performance test:

1. Start Storybook: `pnpm storybook`
2. Navigate to `Editor / LumiaEditor / Large Document`
3. Verify that the document loads smoothly and typing latency is acceptable (< 16ms).

## Development

To view the editor components in Storybook:

```bash
pnpm storybook
```
