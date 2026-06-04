import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  COOKIE_DISCLOSURE_STORAGE_KEY,
  CookieDisclosure,
} from './cookie-disclosure';
import { createTestRoot, render, teardown } from '../lib/test-utils';

const clearStorage = () => {
  try {
    window.localStorage.clear();
  } catch {
    /* SSR / private mode */
  }
};

describe('<CookieDisclosure>', () => {
  beforeEach(() => clearStorage());
  afterEach(() => clearStorage());

  it('renders the disclosure with a safe policyUrl', async () => {
    const ctx = createTestRoot();
    await render(ctx.root, <CookieDisclosure policyUrl="/legal/cookies" />);
    const region = ctx.host.querySelector('[data-lumia-cookie-disclosure]');
    expect(region).toBeTruthy();
    expect(region?.getAttribute('role')).toBe('region');
    expect(region?.getAttribute('aria-label')).toBe('Cookie disclosure');
    // CRITICAL: must NOT be modal
    expect(region?.getAttribute('aria-modal')).toBeNull();
    expect(ctx.host.querySelector('a[href="/legal/cookies"]')).toBeTruthy();
    await teardown(ctx);
  });

  it('renders nothing for an unsafe policyUrl', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <CookieDisclosure policyUrl="javascript:alert(1)" />,
    );
    expect(ctx.host.querySelector('[data-lumia-cookie-disclosure]')).toBeNull();
    await teardown(ctx);
  });

  it('persists dismissal in localStorage (no cookie set)', async () => {
    const ctx = createTestRoot();
    await render(ctx.root, <CookieDisclosure policyUrl="/legal/cookies" />);
    const dismiss = ctx.host.querySelector(
      '[data-marketing-cookie-dismiss]',
    ) as HTMLButtonElement;
    expect(dismiss).toBeTruthy();
    const { act } = await import('react');
    await act(async () => {
      dismiss.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(ctx.host.querySelector('[data-lumia-cookie-disclosure]')).toBeNull();
    expect(window.localStorage.getItem(COOKIE_DISCLOSURE_STORAGE_KEY)).toBe(
      'true',
    );
    // Defense in depth: no cookie was set.
    expect(document.cookie).not.toContain(COOKIE_DISCLOSURE_STORAGE_KEY);
    await teardown(ctx);
  });

  it('stays dismissed across remounts (persistence)', async () => {
    window.localStorage.setItem(COOKIE_DISCLOSURE_STORAGE_KEY, 'true');
    const ctx = createTestRoot();
    await render(ctx.root, <CookieDisclosure policyUrl="/legal/cookies" />);
    expect(ctx.host.querySelector('[data-lumia-cookie-disclosure]')).toBeNull();
    await teardown(ctx);
  });

  it('uses a custom storage key when supplied', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <CookieDisclosure
        policyUrl="/legal/cookies"
        storageKey="my.custom.key"
      />,
    );
    const dismiss = ctx.host.querySelector(
      '[data-marketing-cookie-dismiss]',
    ) as HTMLButtonElement;
    const { act } = await import('react');
    await act(async () => {
      dismiss.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(window.localStorage.getItem('my.custom.key')).toBe('true');
    expect(
      window.localStorage.getItem(COOKIE_DISCLOSURE_STORAGE_KEY),
    ).toBeNull();
    await teardown(ctx);
  });

  it('renders the supplied override message + labels', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <CookieDisclosure
        policyUrl="/legal/cookies"
        message="Nous utilisons un cookie de session."
        policyLabel="Politique de cookies"
        dismissLabel="J'ai compris"
      />,
    );
    expect(ctx.host.textContent).toContain(
      'Nous utilisons un cookie de session.',
    );
    expect(ctx.host.textContent).toContain('Politique de cookies');
    expect(ctx.host.textContent).toContain("J'ai compris");
    await teardown(ctx);
  });
});
