# @lumia-ui/editor-renderer

A standalone, read-only renderer for Lumia Editor documents (Lexical JSON).

## Installation

```bash
pnpm add @lumia-ui/editor-renderer
```

## Usage

```tsx
import { LumiaDocument } from '@lumia-ui/editor-renderer';
import type { LumiaEditorStateJSON } from '@lumia-ui/editor-renderer';

const json: LumiaEditorStateJSON = {
  // ... your editor state
};

function MyPage() {
  return (
    <LumiaDocument value={json} />
  );
}
```

## Features

- **Zero dependencies** on Lexical editor (lightweight).
- **Supports all Core Blocks**: Paragraph, Heading, Lists, Links, Quotes, Code.
- **Supports Custom Blocks**:
  - `status` (Status Pill)
  - `panel-block` (Info/Warning/Success/Note panels)
  - `image-block` (Images with layouts)
  - `video-block` (YouTube, Vimeo, Loom, HTML5)
  - `file-block` (File attachments)
  - `table` (Tables)


## Examples

Check out the Storybook for live examples:

- **Marketing Document**: Rich text processing with hero images and key points.
- **Knowledge Base Article**: Technical documentation with status indicators and panels.
- **Blog Post**: Content with code snippets, video tutorials, and data tables.

## Props

| Prop | Type | Description |
|------|------|-------------|
| `value` | `LumiaEditorStateJSON` | The JSON output from Lumia Editor. |
| `blockRegistry` | `BlockDefinition[]` | Optional registry to override or extend block rendering components. |
| `className` | `string` | Optional CSS class for the container. |

## Testing

To ensure compatibility between the Editor's JSON output and this Renderer, we include a compatibility suite integration test.

```bash
# Run compatibility tests
npm run test
```

This verifies that all supported core and custom blocks (Image, Video, Panel, etc.) render correctly from a standardized JSON fixture.
