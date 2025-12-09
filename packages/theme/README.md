# @lumia-ui/theme

`ThemeProvider` and Tailwind preset for applying Lumia token CSS variables.

## Install

```bash
pnpm add @lumia-ui/theme @lumia-ui/tokens
```

## Wrap your app

```tsx
import { ThemeProvider } from '@lumia-ui/theme';

export function App({ children }: { children: React.ReactNode }) {
  // Defaults to "light" theme (sets data-theme="light")
  return <ThemeProvider>{children}</ThemeProvider>;
}
```

To switch themes, pass a string:

```tsx
<ThemeProvider theme="dark">
  {children}
</ThemeProvider>
```

By default variables write to `document.documentElement` with `data-theme` attribute. To scope them, pass a DOM node:

```tsx
const ref = useRef<HTMLDivElement>(null);

return (
  <div ref={ref}>
    <ThemeProvider theme="dark" target={ref.current}>
      {/* scoped content */}
    </ThemeProvider>
  </div>
);
```

### Legacy Support

You can still pass a theme object (e.g. `defaultTheme`), but using string names is recommended as it leverages static CSS variables.

## Tailwind preset/config helper

Expose Lumia tokens to Tailwind using the exported preset or config factory:

```js
// tailwind.config.js
import { createLumiaTailwindConfig, lumiaTailwindPreset } from '@lumia-ui/theme';

export default {
  presets: [lumiaTailwindPreset],
  // or: ...createLumiaTailwindConfig(),
};
```
