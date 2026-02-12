import { describe, expect, it, vi } from 'vitest';
import {
  getNotificationGroupLabel,
  getUnreadNotificationIds,
  groupNotificationsByDate,
  isNavItemActive,
  isSafeNotificationHref,
} from './dashboard-shell.utils';

describe('isNavItemActive', () => {
  it('matches exact paths when exact=true', () => {
    expect(isNavItemActive('/dashboard/users', '/dashboard/users', true)).toBe(
      true,
    );
    expect(
      isNavItemActive('/dashboard/users/1', '/dashboard/users', true),
    ).toBe(false);
  });

  it('matches prefix paths when exact=false', () => {
    expect(isNavItemActive('/dashboard/users', '/dashboard/users', false)).toBe(
      true,
    );
    expect(
      isNavItemActive('/dashboard/users/1/details', '/dashboard/users', false),
    ).toBe(true);
    expect(
      isNavItemActive('/dashboard/settings', '/dashboard/users', false),
    ).toBe(false);
  });

  it('normalizes trailing slashes', () => {
    expect(isNavItemActive('/dashboard/users/', '/dashboard/users', true)).toBe(
      true,
    );
    expect(
      isNavItemActive('/dashboard/users/', '/dashboard/users', false),
    ).toBe(true);
  });

  it('matches root nav item only on root path', () => {
    expect(isNavItemActive('/', '/', false)).toBe(true);
    expect(isNavItemActive('/dashboard/users', '/', false)).toBe(false);
  });
});

describe('isSafeNotificationHref', () => {
  it('accepts relative and http(s) URLs', () => {
    expect(isSafeNotificationHref('/dashboard/users')).toBe(true);
    expect(isSafeNotificationHref('https://xynes.com/path')).toBe(true);
    expect(isSafeNotificationHref('http://xynes.com/path')).toBe(true);
  });

  it('rejects unsafe and malformed URLs', () => {
    expect(isSafeNotificationHref('javascript:alert(1)')).toBe(false);
    expect(isSafeNotificationHref('data:text/html;base64,AAAA')).toBe(false);
    expect(isSafeNotificationHref('//evil.com')).toBe(false);
    expect(isSafeNotificationHref('///evil.com')).toBe(false);
    expect(isSafeNotificationHref('not-a-url')).toBe(false);
    expect(isSafeNotificationHref('')).toBe(false);
    expect(isSafeNotificationHref(undefined)).toBe(false);
  });
});

describe('notification grouping helpers', () => {
  it('returns Today and Yesterday labels', () => {
    const now = new Date();
    now.setHours(12, 0, 0, 0);

    const today = new Date(now);
    today.setHours(8, 0, 0, 0);

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(8, 0, 0, 0);

    expect(getNotificationGroupLabel(today, now)).toBe('Today');
    expect(getNotificationGroupLabel(yesterday, now)).toBe('Yesterday');
  });

  it('groups and sorts notifications by createdAt desc', () => {
    const now = new Date('2026-02-12T12:00:00.000Z');
    const notifications = [
      { id: 'n3', createdAt: '2026-02-10T08:00:00.000Z' },
      { id: 'n1', createdAt: '2026-02-12T09:00:00.000Z' },
      { id: 'n2', createdAt: '2026-02-12T07:00:00.000Z' },
    ];

    const groups = groupNotificationsByDate(notifications, now);
    expect(groups[0]?.label).toBe('Today');
    expect(groups[0]?.items.map((item) => item.id)).toEqual(['n1', 'n2']);
    expect(groups[1]?.items.map((item) => item.id)).toEqual(['n3']);
  });

  it('skips invalid createdAt values and warns once per invalid item', () => {
    const now = new Date('2026-02-12T12:00:00.000Z');
    const warnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    const notifications = [
      { id: 'n1', createdAt: '2026-02-12T09:00:00.000Z' },
      { id: 'n2', createdAt: 'not-a-date' },
      { id: 'n3', createdAt: '2026-02-11T07:00:00.000Z' },
    ];

    const groups = groupNotificationsByDate(notifications, now);
    expect(
      groups.flatMap((group) => group.items.map((item) => item.id)),
    ).toEqual(['n1', 'n3']);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toContain(
      'Skipping notification with invalid createdAt',
    );

    warnSpy.mockRestore();
  });

  it('returns unread notification ids', () => {
    const unreadIds = getUnreadNotificationIds([
      { id: 'n1', unread: true },
      { id: 'n2', unread: false },
      { id: 'n3', unread: true },
    ]);
    expect(unreadIds).toEqual(['n1', 'n3']);
  });
});
