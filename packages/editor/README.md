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
- `font` - For inline font application (overrides block-level fonts)

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

#### Font Selection Behavior

When using the FontCombobox in the full editor:

- **Single font**: If all blocks have the same font, that font is shown in the dropdown
- **Mixed fonts**: If the document contains blocks with different fonts, the dropdown shows a placeholder ("Select font...") to indicate the mixed state
- **Applying font**: Selecting a font from the dropdown applies it to the current block (or all selected blocks in a real selection implementation)

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
- No font ID specified → uses `defaultFontId` when rendering

#### Document Loading with Font Normalization

When loading existing documents, you can automatically normalize fonts using `jsonToEditorState`:

```typescript
import { jsonToEditorState, normalizeDocumentFonts } from '@lumia/editor';

// Option 1: Normalize during editor state conversion
const editorState = jsonToEditorState(doc, brandFonts);

// Option 2: Normalize document directly (pure function)
const normalizedDoc = normalizeDocumentFonts(doc, brandFonts);
```

This ensures that documents created before font restrictions were in place are automatically updated to comply with brand guidelines.

## HTML Serialization

The editor supports exporting documents to HTML with class-based font styling.

### `docNodeToHtml(doc: DocNode, options?: { fonts?: FontConfig }): string`

Convert a `DocNode` to an HTML string with CSS class names for fonts:

```typescript
import { docNodeToHtml } from '@lumia/editor';

const html = docNodeToHtml(doc, { fonts: brandFonts });
// Output: <p class="font-roboto">Hello World</p>
```

### Class-Based Font Styling

The serializer generates CSS class names for fonts instead of inline styles:

**Block-Level Fonts** (baseline):
- Applied via `attrs.fontId` on `paragraph`, `heading`, and `list_item` nodes
- Generates `class="font-{id}"` on the HTML element
- Default fonts generate no class (no redundancy)

**Inline Font Marks** (override):
- Applied via `font` mark with `attrs.fontId` on text nodes
- Wraps text in `<span class="font-{id}">...</span>`
- Overrides block-level font for specific text spans

#### Required CSS Classes

You must define CSS classes for each font in your stylesheet:

```css
.font-inter {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.font-roboto {
  font-family: "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
}

.font-lora {
  font-family: "Lora", Georgia, "Times New Roman", serif;
}

/* Add more fonts as needed */
```

### Font Serialization Examples

**Block-level font (paragraph):**
```typescript
const doc = {
  type: 'doc',
  content: [{
    type: 'paragraph',
    attrs: { fontId: 'roboto' },
    content: [{ type: 'text', text: 'Hello World' }],
  }],
};

docNodeToHtml(doc, { fonts: brandFonts });
// Output: <p class="font-roboto">Hello World</p>
```

**Default font (no class):**
```typescript
const doc = {
  type: 'doc',
  content: [{
    type: 'paragraph',
    attrs: { fontId: 'inter' }, // Assuming inter is default
    content: [{ type: 'text', text: 'Hello' }],
  }],
};

docNodeToHtml(doc, { fonts: brandFonts });
// Output: <p>Hello</p>  (no class for default font)
```

**Inline font mark (override):**
```typescript
const doc = {
  type: 'doc',
  content: [{
    type: 'paragraph',
    attrs: { fontId: 'inter' }, // Block-level font
    content: [
      { type: 'text', text: 'Normal ' },
      {
        type: 'text',
        text: 'special',
        marks: [{ type: 'font', attrs: { fontId: 'roboto' } }], // Inline override
      },
    ],
  }],
};

docNodeToHtml(doc, { fonts: brandFonts });
// Output: <p>Normal <span class="font-roboto">special</span></p>
```

**Heading with font:**
```typescript
const doc = {
  type: 'doc',
  content: [{
    type: 'heading',
    attrs: { level: 1, fontId: 'roboto' },
    content: [{ type: 'text', text: 'Title' }],
  }],
};

docNodeToHtml(doc, { fonts: brandFonts });
// Output: <h1 class="font-roboto">Title</h1>
```

### Font Normalization in HTML

Invalid or disallowed fonts are normalized to the default font during serialization:

```typescript
const doc = {
  type: 'doc',
  content: [{
    type: 'paragraph',
    attrs: { fontId: 'comic-sans' }, // Not in allowedFonts
    content: [{ type: 'text', text: 'Hello' }],
  }],
};

const brandFonts = {
  allFonts: [{ id: 'inter', label: 'Inter', category: 'sans' }],
  allowedFonts: ['inter'],
  defaultFontId: 'inter',
};

docNodeToHtml(doc, { fonts: brandFonts });
// Output: <p>Hello</p>  
// (comic-sans → inter → default → no class)
```

### Backward Compatibility: Font Family CSS Stacks

For consumers who need inline CSS font-family values, use the deprecated `getFontFamily` utility:

```typescript
import { getFontFamily } from '@lumia/editor';

const fontStack = getFontFamily('roboto');
// Returns: "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif
```

### Example: Complete Workflow with Font Enforcement

```typescript
import {
  LumiaEditor,
  docNodeToHtml,
  normalizeDocumentFonts,
  type DocNode,
  type FontConfig,
} from '@lumia/editor';

const brandFonts: FontConfig = {
  allFonts: [
    { id: 'brand-sans', label: 'Brand Sans', category: 'sans' },
    { id: 'brand-serif', label: 'Brand Serif', category: 'serif' },
  ],
  allowedFonts: ['brand-sans'], // Only allow brand-sans
  defaultFontId: 'brand-sans',
};

// Load and normalize existing document
const loadedDoc: DocNode = JSON.parse(localStorage.getItem('doc'));
const normalizedDoc = normalizeDocumentFonts(loadedDoc, brandFonts);

// Edit with enforced fonts
<LumiaEditor
  value={normalizedDoc}
  onChange={setDoc}
  fonts={brandFonts}
/>

// Export to HTML with correct font stacks
const html = docNodeToHtml(normalizedDoc, { fonts: brandFonts });
```

## Accessibility & Keyboard Navigation

The Lumia editor is built with accessibility as a core principle, ensuring full keyboard navigation and screen reader support.

### ARIA Attributes

All interactive elements include proper ARIA attributes for screen reader compatibility:

**Toolbar Buttons:**
- All icon-only buttons have `aria-label` (e.g., "Bold", "Italic", "Insert link")
- Toggle buttons include `aria-pressed` to announce their state (pressed/not pressed)
- Block type dropdown includes `aria-label="Block type"`

**Inline Editor:**
- View mode: `role="button"` with `aria-label="Click to edit text"`
- Edit mode: `role="textbox"` with `aria-label="Inline editor"`

**Form Elements:**
- Editor textarea: `aria-label="Editor content"`
- All form controls have accessible names for screen readers

### Keyboard Navigation

The editor supports full keyboard navigation without requiring a mouse:

**Toolbar Navigation:**
- **Tab**: Move forward through toolbar controls
- **Shift + Tab**: Move backward through toolbar controls
- **Enter** or **Space**: Activate the focused button
- Focus order: Block type → Font selector → Bold → Italic → Link → ...

**Inline Editor:**
- **Click** or **Focus**: Enter editing mode
- **Escape**: Exit editing mode and return focus to view mode

**Future Enhancements:**
- **Cmd/Ctrl + B**: Toggle bold (planned)
- **Cmd/Ctrl + I**: Toggle italic (planned)

### Focus Management

All interactive elements display visible focus rings when navigated via keyboard:

- Primary color focus ring (`ring-primary-500`)
- 2px ring width for clear visibility
- Focus ring offset for better visual separation
- Enhanced focus visibility in inline editor (`focus-visible:ring-2`)

### Screen Reader Support

The editor is tested for compatibility with:
- **macOS**: VoiceOver
- **Windows**: NVDA, JAWS
- **Linux**: Orca

Screen readers will announce:
- Button labels and their purpose
- Toggle button states (pressed/not pressed)
- Form control labels
- Editor mode changes (view/edit)
- Selection and focus changes

### Testing

The editor includes comprehensive accessibility tests:

**Automated Testing:**
- **axe-core** integration for WCAG 2.1 Level AA compliance
- Automated accessibility scans on all editor variants
- 11 dedicated accessibility test cases

**Keyboard Navigation Testing:**
- Tab order verification
- Enter/Space key activation tests
- Escape key functionality tests
- 14 dedicated keyboard navigation test cases

To run accessibility tests:

```bash
pnpm --filter @lumia/editor test
```

### Best Practices

When using the editor, follow these best practices for accessibility:

1. **Always provide labels**: Ensure the editor is properly labeled in your application context
2. **Keyboard testing**: Test all interactions with keyboard-only navigation
3. **Screen reader testing**: Verify announcements with at least one screen reader
4. **Color contrast**: Ensure sufficient contrast for focus indicators
5. **Error messaging**: Provide clear, accessible error messages for validation

### Compliance

The Lumia editor meets the following accessibility standards:

- ✅ **WCAG 2.1 Level AA** - Verified via automated axe-core scans
- ✅ **Section 508** - Full keyboard accessibility
- ✅ **ARIA 1.2** - Proper use of ARIA roles, states, and properties

For accessibility issues or suggestions, please file an issue on GitHub.

