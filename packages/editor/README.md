# @lumia/editor

The core editor package for Lumia DS, built on top of [Lexical](https://lexical.dev/).

## Installation

```bash
pnpm add @lumia/editor
```

## Usage

```tsx
import { LumiaEditor } from '@lumia/editor';

function App() {
  return <LumiaEditor placeholder="Start typing..." />;
}

// Internal usage
import { InternalLexicalEditor } from '@lumia/editor/internal';

function InternalApp() {
  return <InternalLexicalEditor />;
}
```

## Development

To view the editor components in Storybook:

```bash
pnpm storybook
```
