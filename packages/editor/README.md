# @lumia/editor

The core editor package for Lumia DS, built on top of [Lexical](https://lexical.dev/).

## Installation

```bash
pnpm add @lumia/editor
```

## Features

- **Rich Text**: Paragraphs, Headings (H1-H3), Lists (Bullet, Numbered), Quotes, Code Blocks, Images (Upload & URL), Tables.
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

The editor includes a block registry system to manage different block types (e.g., paragraph, heading, image, video). This is the single source of truth for block metadata.

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

#### `BlockDefinition`

Interface for block metadata:

```typescript
interface BlockDefinition {
  type: BlockType;
  label: string;
  icon: React.ComponentType;
  nodeClass: Klass<LexicalNode>;
  inspector?: React.ComponentType<{ nodeKey: NodeKey }>;
  description?: string;       // Description shown in slash menu
  keywords?: string[];        // Keywords for slash menu filtering
  slashCommand?: string;      // Custom slash command name
}
```

#### `getBlockDefinition(type)`

Retrieve a single block definition by type:

```typescript
import { getBlockDefinition } from '@lumia/editor/blocks';

const imageBlock = getBlockDefinition('image');
// Returns BlockDefinition for 'image'
```

#### `getBlockDefinitions()`

Retrieve all registered block definitions:

```typescript
import { getBlockDefinitions } from '@lumia/editor/blocks';

const allBlocks = getBlockDefinitions();
// Returns BlockDefinition[] with all 9 core block types
```

#### `getInsertableBlocks()`

Retrieve only block definitions that can be inserted via the Insert menu:

```typescript
import { getInsertableBlocks } from '@lumia/editor/blocks';

const insertableBlocks = getInsertableBlocks();
// Returns BlockDefinition[] with insertable: true
```

### Insert Menu

The editor toolbar includes an **Insert** dropdown menu that is dynamically generated from the BlockRegistry. Blocks with `insertable: true` appear in this menu.

To make a custom block appear in the Insert menu, add these fields to your BlockDefinition:

```typescript
const customBlock: BlockDefinition = {
  type: 'custom',
  label: 'Custom Block',
  icon: CustomIcon,
  nodeClass: CustomNode,
  insertable: true,         // Appear in Insert menu
  insertAction: 'command',  // 'command' for simple insert, 'custom' for dialog
};
```

**Insert Action Types:**
- `'command'` - Dispatches insert command directly (e.g., table, status)
- `'custom'` - Opens a dialog/popover for additional input (e.g., image URL, panel variant)


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
- **Auto-Embed**: When you paste a YouTube, Vimeo, or Loom URL, it is automatically converted to a VideoBlockNode embed. The plugin intercepts paste events and creates an embedded video block if the pasted content is a valid video URL.
- **Insert Video (Toolbar)**: Use the Video button in the toolbar to open a dialog where you can enter a video URL and optionally override the provider detection (Auto-detect, YouTube, Vimeo, Loom, HTML5).
- **Insert Video (Slash Menu)**: Type `/video` at the start of a line or after a space to insert a video block via the slash menu.

### Slash Menu

The editor supports a slash menu for quick block insertion.

- **Trigger**: Type `/` at the start of a line or after whitespace to open the menu.
- **Navigation**: Use arrow keys (↑/↓) to navigate, Enter to select, Escape to close.
- **Powered by BlockRegistry**: Commands are dynamically generated from blocks with `slashEnabled: true`.
- **Available Commands**:
  - `/image` - Insert an image block (prompts for URL)
  - `/video` - Insert a video block (prompts for URL)
  - `/file` - Attach a file
  - `/table` - Insert a 3×3 table
  - `/panel` - Insert an info panel
  - `/status` - Insert a status pill


### Table
The editor supports tables via the `@lexical/table` integration.

**Inserting Tables**:
- **Toolbar**: Click the Table button in the toolbar to insert a 3×3 table at the current selection.
- **Slash Menu**: Type `/table` at the start of a line or after a space to insert a 3×3 table.

**Row & Column Controls**:
When your cursor is inside a table cell, a floating toolbar appears above the table with the following controls:
- **Header row** (checkbox): Toggle the first row as a header row (bold text, contrast background)
- **Insert Row Above**: Add a new row above the current row
- **Insert Row Below**: Add a new row below the current row
- **Delete Row**: Remove the current row (disabled if only one row remains)
- **Insert Column Left**: Add a new column to the left of the current column
- **Insert Column Right**: Add a new column to the right of the current column
- **Delete Column**: Remove the current column (disabled if only one column remains)

**Header Row Toggle**:
Use the "Header row" checkbox in the table toolbar to toggle the styling of the first row:
- When enabled, first row cells are styled as headers with bold text and a contrast background
- When disabled, first row cells revert to normal data cell styling
- Cell content is preserved when toggling
- Header state persists in JSON (`headerState: 1` for headers)

**Keyboard Navigation**:
- Press `Tab` to move to the next cell
- Press `Shift+Tab` to move to the previous cell

Tables are rendered with proper styling including:
- Cell borders and padding
- Header cell styling (with `headerState`)
- Selection highlighting
- Focus outlines for accessibility

```tsx
// Example table JSON structure
const tableJSON = {
  type: 'table',
  children: [
    {
      type: 'tablerow',
      children: [
        { type: 'tablecell', headerState: 1, children: [...] }, // Header cell
        { type: 'tablecell', headerState: 1, children: [...] },
      ]
    },
    {
      type: 'tablerow', 
      children: [
        { type: 'tablecell', headerState: 0, children: [...] }, // Data cell
        { type: 'tablecell', headerState: 0, children: [...] },
      ]
    }
  ]
};
```

To view a demo table, navigate to the `Table / Basic` story in Storybook. To test table controls, navigate to `Table / With Controls`.

### Panel Block
The editor supports panel blocks (callouts) to highlight information, warnings, success messages, or notes.

```tsx
import { $createPanelBlockNode } from '@lumia/editor/nodes/PanelBlockNode';

// Programmatic insertion
editor.update(() => {
  const node = $createPanelBlockNode({
    variant: 'info', // 'info' | 'warning' | 'success' | 'note'
    title: 'Information',
    icon: 'info', // Optional icon key
  });
  // Add content
  const paragraph = $createParagraphNode();
  paragraph.append($createTextNode('This is an info panel.'));
  node.append(paragraph);
  
  $insertNodes([node]);
});
```

- **Variants**: Supports `info`, `warning`, `success`, and `note`.
- **Styling**: Styles match the Lumia UI Alert component.
- **Content**: Supports nested rich-text (paragraphs, lists, etc.) as children.
- **Insert Panel (Toolbar)**: Use the Panel button in the toolbar to insert a panel with a selected variant.
- **Insert Panel (Slash Menu)**: Type `/panel` to insert an info panel.
- **Variant Switching**: Click on an existing panel to use the floating menu to switch between variants.

To view panel demos, navigate to the `Panel / Static` story in Storybook.

### Block Inspector

The `BlockInspector` component provides a context-aware property inspector for the currently selected block. It renders specific inspector controls based on the selected block type (e.g., Image settings when an image is selected).

```tsx
import { BlockInspector, LumiaEditor, EditorProvider } from '@lumia/editor';

function App() {
  return (
    <EditorProvider>
      <div className="flex">
        <div className="flex-1">
          <LumiaEditor />
        </div>
        <div className="w-80 border-l">
          {/* Automatically shows controls for the selected block */}
          <BlockInspector />
        </div>
      </div>
    </EditorProvider>
  );
}
```

- **Registry-Driven**: Inspectors are defined in the `BlockRegistry` via the `inspector` property.
- **Custom Inspectors**: You can provide custom inspector components when registering custom blocks.
- **Fallback**: Displays "No block selected" or "No configurable properties" when appropriate.

### Supported Inspectors

The following core blocks now have dedicated inspectors:

- **Image**:
    - **Alt Text**: Update the alt text for accessibility.
    - **Layout**: Switch between Inline, Breakout, and Full Width layouts.
    - **Width**: Adjust image width percentage via slider.
- **Video**:
    - **URL**: Update the video source URL.
    - **Provider**: Switch provider type (YouTube, Vimeo, Loom, HTML5).
    - **Title**: Update the video title.
- **Panel**:
    - **Variant**: Change panel style (Info, Warning, Success, Note).
    - **Title**: Update the panel title.
- **Status**:
    - **Text**: Update the status label.
    - **Color**: Change the status color (Info, Success, Warning, Error).




### Block Outline

The `BlockOutline` component provides a sidebar navigation listing all top-level blocks in the document. It allows users to quickly jump to specific sections or content blocks.

```tsx
import { BlockOutline, LumiaEditor, EditorProvider } from '@lumia/editor';

function App() {
  return (
    <EditorProvider>
      <div className="flex">
        <div className="w-64 border-r">
          {/* Shows a list of blocks and updates automatically */}
          <BlockOutline />
        </div>
        <div className="flex-1">
          <LumiaEditor />
        </div>
      </div>
    </EditorProvider>
  );
}
```

- **Live Updates**: The outline updates in real-time as content changes (throttled).
- **Navigation**: Clicking an item scrolls the editor to that block and selects it.
- **Active State**: The current block in view is highlighted in the outline.

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
