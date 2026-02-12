import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/utils';

const TRANSITION_MS = 300;

type DrawerSide = 'left' | 'right' | 'bottom' | 'top';

export type DrawerProps = {
  open: boolean;
  onOpenChange: (nextOpen: boolean) => void;
  side?: DrawerSide;
  closeOnOverlayClick?: boolean;
  restoreFocusElement?: HTMLElement | null;
  contentClassName?: string;
  contentStyle?: CSSProperties;
  children: ReactNode;
};

export const Drawer = ({
  open,
  onOpenChange,
  side = 'right',
  closeOnOverlayClick = true,
  restoreFocusElement,
  contentClassName,
  contentStyle,
  children,
}: DrawerProps) => {
  const [isMounted, setIsMounted] = useState(open);
  const [isVisible, setIsVisible] = useState(open);
  const closeTimeoutRef = useRef<number | null>(null);
  const frameOneRef = useRef<number | null>(null);
  const frameTwoRef = useRef<number | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
      if (frameOneRef.current !== null) {
        window.cancelAnimationFrame(frameOneRef.current);
      }
      if (frameTwoRef.current !== null) {
        window.cancelAnimationFrame(frameTwoRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (open) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      setIsMounted(true);
      setIsVisible(false);
      frameOneRef.current = window.requestAnimationFrame(() => {
        frameTwoRef.current = window.requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
      return;
    }

    setIsVisible(false);
    (restoreFocusElement ?? previousActiveElementRef.current)?.focus();
    closeTimeoutRef.current = window.setTimeout(() => {
      setIsMounted(false);
      closeTimeoutRef.current = null;
    }, TRANSITION_MS);
  }, [open, restoreFocusElement]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMounted, onOpenChange]);

  if (!isMounted || typeof document === 'undefined') {
    return null;
  }

  const sideClass =
    side === 'left'
      ? 'left-0 top-0 h-full w-[min(90vw,26rem)]'
      : side === 'right'
        ? 'right-0 top-0 h-full w-[min(90vw,26rem)]'
        : side === 'bottom'
          ? 'bottom-0 left-0 right-0 h-auto w-full'
          : 'left-0 right-0 top-0 h-auto w-full';

  const transformStyle =
    side === 'left'
      ? isVisible
        ? 'translate3d(0, 0, 0)'
        : 'translate3d(-100%, 0, 0)'
      : side === 'right'
        ? isVisible
          ? 'translate3d(0, 0, 0)'
          : 'translate3d(100%, 0, 0)'
        : side === 'bottom'
          ? isVisible
            ? 'translate3d(0, 0, 0)'
            : 'translate3d(0, 100%, 0)'
          : isVisible
            ? 'translate3d(0, 0, 0)'
            : 'translate3d(0, -100%, 0)';

  return createPortal(
    <div
      className={cn('fixed inset-0 z-40', !isVisible && 'pointer-events-none')}
      data-lumia-drawer-root
      data-state={isVisible ? 'open' : 'closed'}
    >
      <div
        className={cn(
          'absolute inset-0 bg-foreground/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out',
          isVisible ? 'opacity-100' : 'opacity-0',
        )}
        onClick={closeOnOverlayClick ? () => onOpenChange(false) : undefined}
        data-lumia-drawer-overlay
      />

      <aside
        role="dialog"
        aria-modal="true"
        className={cn(
          'group absolute border border-border bg-background p-6 shadow-lg transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          sideClass,
          contentClassName,
        )}
        style={{
          ...contentStyle,
          transform: transformStyle,
          transition: 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'transform',
        }}
        data-lumia-drawer-content
        data-lumia-drawer-side={side}
      >
        <button
          type="button"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Close drawer"
          onClick={() => onOpenChange(false)}
        >
          <span aria-hidden className="relative h-4 w-4">
            <span
              className={cn(
                'absolute left-1/2 top-1/2 h-0.5 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                isVisible ? 'rotate-45' : 'rotate-0',
              )}
            />
            <span
              className={cn(
                'absolute left-1/2 top-1/2 h-0.5 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                isVisible ? '-rotate-45' : 'rotate-0',
              )}
            />
          </span>
          <span className="sr-only">Close drawer</span>
        </button>

        <div className="h-full min-h-0 overflow-y-auto pr-1">{children}</div>
      </aside>
    </div>,
    document.body,
  );
};

export type DrawerHeaderProps = HTMLAttributes<HTMLDivElement>;

export const DrawerHeader = ({ className, ...props }: DrawerHeaderProps) => (
  <div className={cn('flex flex-col gap-2 text-left', className)} {...props} />
);

export type DrawerTitleProps = HTMLAttributes<HTMLHeadingElement>;

export const DrawerTitle = ({ className, ...props }: DrawerTitleProps) => (
  <h2 className={cn('text-lg font-semibold leading-6', className)} {...props} />
);
