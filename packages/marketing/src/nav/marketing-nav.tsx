'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import type { HTMLAttributes, KeyboardEvent } from 'react';

import { Brand, buttonStyles } from '@lumia-ui/components';

import { cn, isSafeMarketingHref } from '../lib/utils';
import type { MarketingBrand, MarketingCta } from '../lib/types';

export type MarketingNavProps = HTMLAttributes<HTMLElement> & {
  /** Brand mark rendered on the left side of the nav. */
  brand: MarketingBrand;
  /** Up to four CTAs rendered on the right side, in source order. */
  actions: ReadonlyArray<MarketingCta>;
  /**
   * When `true`, the nav stays pinned to the top of the viewport and gains a
   * backdrop blur once the page scrolls past the trigger threshold. Defaults
   * to `true`.
   */
  sticky?: boolean;
  /**
   * Scroll offset in pixels at which the nav swaps from transparent to
   * blurred-background. Defaults to 16 px.
   */
  scrollThreshold?: number;
  /**
   * Accessible label for the `<nav>` landmark. Defaults to `"Primary"`.
   */
  'aria-label'?: string;
};

const ctaVariantClass = (
  variant: MarketingCta['variant'] = 'ghost',
): string => {
  // Compose the underlying Button base + variant + medium-size classes so the
  // anchor element below renders pixel-identical to a Lumia `<Button>` without
  // breaking the HTML rule "button must not contain an anchor" (AGENTS.md
  // workspace-root rule: use the exported style helper for link-shaped CTAs).
  const baseSize = buttonStyles.sizes.md;
  const variantClass = buttonStyles.variants[variant];
  return cn(buttonStyles.base, variantClass, baseSize);
};

const buildBrandLabel = (
  brand: MarketingBrand,
): { label?: string; decorative: boolean } => {
  if (brand.label === undefined) {
    return { decorative: true };
  }
  return { label: brand.label, decorative: false };
};

/**
 * Top navigation for marketing surfaces. Sticky on scroll, blurs the
 * background once the page is scrolled past `scrollThreshold` px, collapses
 * to a hamburger menu below 768 px, and exposes a keyboard-driven menu.
 *
 * Server-component-friendly with a `'use client'` boundary for the scroll
 * listener + menu toggle state.
 *
 * @see LP-DS plan §4 (API contract) and §8 (accessibility invariants).
 */
export const MarketingNav = forwardRef<HTMLElement, MarketingNavProps>(
  function MarketingNav(
    {
      brand,
      actions,
      sticky = true,
      scrollThreshold = 16,
      className,
      'aria-label': ariaLabel = 'Primary',
      ...rest
    },
    ref,
  ) {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuId = useId();
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (!sticky) return undefined;
      const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      const handleScroll = () => {
        const past = window.scrollY > scrollThreshold;
        // Under reduced-motion the backdrop blur transition is skipped but
        // the class still toggles so semantics stay consistent.
        if (past !== scrolled) {
          setScrolled(past);
        }
      };
      handleScroll();
      window.addEventListener('scroll', handleScroll, { passive: true });
      // Suppress unused-var warning under reduced-motion check.
      void reducedMotion;
      return () => window.removeEventListener('scroll', handleScroll);
    }, [scrolled, sticky, scrollThreshold]);

    useEffect(() => {
      if (!menuOpen) return undefined;
      const handleKey = (event: globalThis.KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          setMenuOpen(false);
        }
      };
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
    }, [menuOpen]);

    const handleMenuKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Tab' && !event.shiftKey) {
          // Close menu on Tab-out so focus moves to page content cleanly.
          const focusables =
            menuRef.current?.querySelectorAll<HTMLElement>('a, button');
          const last = focusables?.[focusables.length - 1];
          if (last && document.activeElement === last) {
            setMenuOpen(false);
          }
        }
      },
      [],
    );

    const safeActions = actions.filter((a) => isSafeMarketingHref(a.href));
    const brandLabel = buildBrandLabel(brand);
    const brandHrefSafe = isSafeMarketingHref(brand.href) ? brand.href : '/';

    return (
      <nav
        ref={ref}
        aria-label={ariaLabel}
        data-lumia-marketing-nav=""
        data-scrolled={scrolled ? 'true' : 'false'}
        className={cn(
          'top-0 z-40 w-full transition-colors duration-200',
          'motion-reduce:transition-none',
          sticky && 'sticky',
          scrolled
            ? 'border-b border-border bg-background/80 backdrop-blur'
            : 'bg-transparent',
          className,
        )}
        {...rest}
      >
        <div className="mx-auto flex h-16 w-full max-w-[64rem] items-center justify-between px-4 sm:px-6">
          <a
            href={brandHrefSafe}
            className="inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label={brandLabel.label ?? 'xynes home'}
          >
            {brandLabel.decorative ? (
              <Brand
                variant={brand.variant}
                size={brand.size ?? 'sm'}
                aria-hidden
              />
            ) : (
              <Brand
                variant={brand.variant}
                size={brand.size ?? 'sm'}
                aria-label={brandLabel.label ?? 'xynes'}
              />
            )}
          </a>
          {/* Desktop actions */}
          <div className="hidden items-center gap-2 md:flex">
            {safeActions.map((action) => (
              <a
                key={`${action.label}:${action.href}`}
                href={action.href}
                target={action.target}
                rel={
                  action.target === '_blank' ? 'noopener noreferrer' : undefined
                }
                data-cta-id={action.id}
                className={ctaVariantClass(action.variant)}
              >
                {action.label}
                {action.target === '_blank' ? (
                  <span className="sr-only"> (opens in new tab)</span>
                ) : null}
              </a>
            ))}
          </div>
          {/* Mobile toggle */}
          <button
            type="button"
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-md md:hidden',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            )}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span aria-hidden className="block h-0.5 w-5 bg-foreground" />
          </button>
        </div>
        {/* Mobile menu */}
        {menuOpen ? (
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            onKeyDown={handleMenuKeyDown}
            className="md:hidden border-t border-border bg-background"
          >
            <div className="flex flex-col gap-2 p-4">
              {safeActions.map((action) => (
                <a
                  key={`${action.label}:${action.href}`}
                  href={action.href}
                  target={action.target}
                  rel={
                    action.target === '_blank'
                      ? 'noopener noreferrer'
                      : undefined
                  }
                  data-cta-id={action.id}
                  className={ctaVariantClass(action.variant)}
                  role="menuitem"
                >
                  {action.label}
                  {action.target === '_blank' ? (
                    <span className="sr-only"> (opens in new tab)</span>
                  ) : null}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </nav>
    );
  },
);
