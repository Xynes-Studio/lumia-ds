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
  const [value, setValue] = useState(null);
  
  return (
    <LumiaEditor 
      value={value} 
      onChange={setValue} 
    />
  );
}
```

## Development

To view the editor components in Storybook:

```bash
pnpm storybook
```
