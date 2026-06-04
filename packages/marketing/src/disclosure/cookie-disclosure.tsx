'use client';

import { forwardRef, useCallback, useEffect, useState } from 'react';
import type { HTMLAttributes } from 'react';

import { cn, isSafeMarketingHref } from '../lib/utils';

const STORAGE_KEY = 'lumia-marketing.cookie-disclosure.dismissed';

export type CookieDisclosureProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Cookie / privacy policy URL. Required. Must be a relative URL or an
   * absolute `https://` URL.
   */
  policyUrl: string;
  /**
   * Override message. Defaults to a stable, non-tracking-friendly phrasing.
   * Consumers can pass a localized message from their catalog.
   */
  message?: string;
  /** Override action label. Defaults to `"Cookie policy"`. */
  policyLabel?: string;
  /** Override dismiss label. Defaults to `"Got it"`. */
  dismissLabel?: string;
  /**
   * Optional `localStorage` key override. Use this when the same surface
   * needs to remember dismissals scoped to a sub-experience (e.g. preview
   * environments).
   */
  storageKey?: string;
};

const safeLocalStorageGet = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeLocalStorageSet = (key: string, value: string): void => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* SSR / private mode / quota — ignore */
  }
};

/**
 * Sticky, non-blocking cookie disclosure rendered at the bottom of the
 * viewport. Dismissal persists in `localStorage` only — no cookie is set, no
 * third-party network call is made.
 *
 * Per LP-DS plan §6, the disclosure:
 *   - is NOT a modal,
 *   - does NOT trap focus,
 *   - does NOT carry `aria-modal`,
 *   - does NOT block content interaction below it.
 *
 * The component renders nothing when `policyUrl` fails the safe-URL guard
 * (defense in depth — empty / malformed URLs make the disclosure pointless).
 */
export const CookieDisclosure = forwardRef<
  HTMLDivElement,
  CookieDisclosureProps
>(function CookieDisclosure(
  {
    policyUrl,
    message = 'We use a session cookie for sign-in. No tracking cookies.',
    policyLabel = 'Cookie policy',
    dismissLabel = 'Got it',
    storageKey = STORAGE_KEY,
    className,
    ...rest
  },
  ref,
) {
  const [hydrated, setHydrated] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const stored = safeLocalStorageGet(storageKey);
    setDismissed(stored === 'true');
  }, [storageKey]);

  const handleDismiss = useCallback(() => {
    safeLocalStorageSet(storageKey, 'true');
    setDismissed(true);
  }, [storageKey]);

  if (!isSafeMarketingHref(policyUrl)) return null;
  if (!hydrated) return null; // Prevent hydration mismatch on SSR.
  if (dismissed) return null;

  return (
    <div
      ref={ref}
      role="region"
      aria-label="Cookie disclosure"
      data-lumia-cookie-disclosure=""
      className={cn(
        'fixed bottom-4 left-4 right-4 z-50',
        'mx-auto max-w-[40rem]',
        'rounded-lg border border-border bg-background p-4 shadow-md',
        'flex flex-wrap items-center justify-between gap-3 text-sm',
        'motion-reduce:transition-none',
        className,
      )}
      {...rest}
    >
      <p className="m-0 flex-1 text-foreground">
        {message}{' '}
        <a
          href={policyUrl}
          className="underline hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
          data-marketing-cookie-policy=""
        >
          {policyLabel}
        </a>
      </p>
      <button
        type="button"
        onClick={handleDismiss}
        data-marketing-cookie-dismiss=""
        className={cn(
          'inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium',
          'bg-foreground text-background hover:opacity-90',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        )}
      >
        {dismissLabel}
      </button>
    </div>
  );
});

export const COOKIE_DISCLOSURE_STORAGE_KEY = STORAGE_KEY;
