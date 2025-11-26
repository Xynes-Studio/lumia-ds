# @lumia/theme

`ThemeProvider` and Tailwind preset for applying Lumia token CSS variables.

## Install

```bash
pnpm add @lumia/theme @lumia/tokens
```

## Wrap your app

```tsx
import { ThemeProvider } from '@lumia/theme';
import { defaultTheme } from '@lumia/tokens';

export function App({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={defaultTheme}>{children}</ThemeProvider>;
}
```

By default variables write to `document.documentElement`. To scope them, pass a DOM node:

```tsx
const ref = useRef<HTMLDivElement>(null);

return (
  <div ref={ref}>
    <ThemeProvider theme={defaultTheme} target={ref.current}>
      {/* scoped content */}
    </ThemeProvider>
  </div>
);
```

## Tailwind preset/config helper

Expose Lumia tokens to Tailwind using the exported preset or config factory:

```js
// tailwind.config.js
import { createLumiaTailwindConfig, lumiaTailwindPreset } from '@lumia/theme';

export default {
  presets: [lumiaTailwindPreset],
  // or: ...createLumiaTailwindConfig(),
};
```
