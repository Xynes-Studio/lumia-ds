import type { ComponentPropsWithoutRef, ElementRef } from 'react';
import { forwardRef, useEffect, useState } from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '../lib/utils';

export type AvatarSize = 'sm' | 'md' | 'lg';

type AvatarRootProps = ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>;

export type AvatarProps = Omit<AvatarRootProps, 'asChild'> & {
  src?: string;
  alt?: string;
  fallbackInitials?: string;
  size?: AvatarSize;
};

export type AvatarGroupItem = AvatarProps;

export type AvatarGroupProps = {
  avatars: AvatarGroupItem[];
  max?: number;
  size?: AvatarSize;
  className?: string;
  overlap?: boolean;
};

const avatarSizes: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

const overlapOffsets: Record<AvatarSize, string> = {
  sm: '-ml-2',
  md: '-ml-3',
  lg: '-ml-4',
};

const initialsFromText = (value?: string) => {
  if (!value) return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const letters = trimmed
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .filter(Boolean);

  if (letters.length >= 2) {
    return `${letters[0]}${letters[1]}`.toUpperCase();
  }

  return trimmed.slice(0, 2).toUpperCase();
};

export const Avatar = forwardRef<
  ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(function Avatar(
  { src, alt, fallbackInitials, size = 'md', className, children, ...props },
  ref,
) {
  const [status, setStatus] = useState<'idle' | 'loaded' | 'error'>(
    src ? 'idle' : 'error',
  );

  useEffect(() => {
    setStatus(src ? 'idle' : 'error');
  }, [src]);

  const fallbackText =
    initialsFromText(fallbackInitials) ?? initialsFromText(alt) ?? undefined;
  const showFallback = status !== 'loaded';

  return (
    <AvatarPrimitive.Root
      ref={ref}
      data-lumia-avatar
      data-size={size}
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-muted-foreground ring-2 ring-background',
        avatarSizes[size],
        className,
      )}
      {...props}
    >
      {src ? (
        <AvatarPrimitive.Image
          src={src}
          alt={alt}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className="aspect-square h-full w-full object-cover"
        />
      ) : null}
      {showFallback ? (
        <span
          data-lumia-avatar-fallback
          aria-label={alt}
          className="flex h-full w-full items-center justify-center bg-muted text-current font-semibold uppercase tracking-wide"
        >
          {fallbackText}
          {!fallbackText && children}
        </span>
      ) : null}
    </AvatarPrimitive.Root>
  );
});

export const AvatarGroup = ({
  avatars,
  size = 'md',
  max = 5,
  className,
  overlap = true,
}: AvatarGroupProps) => {
  const safeMax = Math.max(1, max);
  const hasOverflow = avatars.length > safeMax;
  const visibleCount = hasOverflow ? safeMax - 1 : avatars.length;
  const visibleAvatars = avatars.slice(0, Math.max(visibleCount, 0));
  const overflowCount = hasOverflow
    ? avatars.length - visibleAvatars.length
    : 0;

  return (
    <div
      role="group"
      data-lumia-avatar-group
      className={cn('flex items-center', className)}
    >
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={avatar.alt ?? avatar.src ?? index}
          size={avatar.size ?? size}
          {...avatar}
          className={cn(
            overlap && index > 0
              ? overlapOffsets[avatar.size ?? size]
              : undefined,
            avatar.className,
          )}
        />
      ))}
      {overflowCount > 0 && (
        <span
          aria-label={`${overflowCount} more`}
          data-lumia-avatar-overflow
          className={cn(
            'flex shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground font-semibold ring-2 ring-background',
            avatarSizes[size],
            overlap && (visibleAvatars.length > 0 || hasOverflow)
              ? overlapOffsets[size]
              : undefined,
          )}
        >
          +{overflowCount}
        </span>
      )}
    </div>
  );
};

export const avatarStyles = {
  sizes: avatarSizes,
  overlapOffsets,
};
