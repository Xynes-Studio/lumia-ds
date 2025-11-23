# @lumia/components

Lumia design-system React components, wrapping shadcn primitives and themed via `@lumia/theme` and `@lumia/tokens`.

## Status

- Skeleton package with a sample `Hello` component to validate the build/test toolchain.

## Usage

```tsx
import { Hello } from '@lumia/components';

export function Example() {
    return <Hello name="Lumia">Child content</Hello>;
}
```

## Local development

- Build: `pnpm --filter @lumia/components build`
- Test (happy-dom): `pnpm --filter @lumia/components test`
