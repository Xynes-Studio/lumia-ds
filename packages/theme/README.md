# @lumia/theme

React `ThemeProvider` for applying Lumia theme tokens as CSS variables.

## Usage

```tsx
import { ThemeProvider } from '@lumia/theme';
import { defaultTheme } from '@lumia/tokens';

export function App({ children }: { children: React.ReactNode }) {
    return <ThemeProvider theme={defaultTheme}>{children}</ThemeProvider>;
}
```

By default variables are written to `document.documentElement`. To scope them, pass a DOM node:

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
    // Option A: preset
    presets: [lumiaTailwindPreset],
    // Option B: spread the generated config
    ...createLumiaTailwindConfig(),
};
```
