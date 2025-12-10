# Avatar (DS-1102)

Circular profile image wrapper built on the shadcn/Radix avatar with Lumia tokens and grouping support.

## Export
- `Avatar`, `AvatarGroup`, `AvatarSize`, `AvatarProps`, `AvatarGroupProps` from `@lumia-ui/components`.

## Avatar Props
- `src?: string` – image URL.
- `alt?: string` – accessible label and fallback initials source.
- `fallbackInitials?: string` – optional explicit initials; falls back to `alt` initials when missing.
- `size?: 'sm' | 'md' | 'lg'` – avatar dimensions, defaults to `md`.
- `className?: string` – tailwind overrides while preserving the circular frame.
- Inherits all `AvatarPrimitive.Root` props except `asChild`.

## AvatarGroup Props
- `avatars: AvatarProps[]` – avatars to render.
- `size?: 'sm' | 'md' | 'lg'` – shared size; individual items can override.
- `max?: number` – maximum rendered count; overflow shows `+N`, defaults to 5.
- `overlap?: boolean` – overlap items with offsets, defaults to `true`.
- `className?: string` – container overrides.

## Usage
```tsx
import { Avatar, AvatarGroup } from '@lumia-ui/components';

<Avatar src="https://avatar.vercel.sh/avery" alt="Avery Parker" />;
<Avatar alt="Jamie Doe" fallbackInitials="JD" />;
<Avatar size="lg" alt="Taylor Smith" />;

<AvatarGroup
  max={4}
  avatars={[
    { src: 'https://avatar.vercel.sh/alex', alt: 'Alex Kim' },
    { src: 'https://avatar.vercel.sh/harper', alt: 'Harper Cole' },
    { fallbackInitials: 'BK', alt: 'Blair King' },
    { alt: 'Rowan Ali' },
    { alt: 'Mina Patel' },
  ]}
/>;
```

## Notes
- Fallback shows initials on missing or broken images and is derived from `fallbackInitials` or `alt`.
- Overlap offsets and sizes use Lumia spacing; the overflow badge inherits the current size.
- The avatar frame includes a subtle border and ring to sit cleanly on varied backgrounds.
