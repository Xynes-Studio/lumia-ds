const normalizePath = (path: string) => path.replace(/\/+$/, '') || '/';

export const isNavItemActive = (
  activePath: string,
  itemHref: string,
  exact = false,
) => {
  const normalizedActivePath = normalizePath(activePath);
  const normalizedItemHref = normalizePath(itemHref);

  if (exact) {
    return normalizedActivePath === normalizedItemHref;
  }

  if (normalizedItemHref === '/') {
    return normalizedActivePath === '/';
  }

  return (
    normalizedActivePath === normalizedItemHref ||
    normalizedActivePath.startsWith(`${normalizedItemHref}/`)
  );
};

export const getFallbackInitials = (value?: string) => {
  const cleaned = value?.trim();
  if (!cleaned) return undefined;

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
  }

  return cleaned.slice(0, 2).toUpperCase();
};

const toDayStart = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate());

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const isAllowedProtocol = (protocol: string) =>
  protocol === 'http:' || protocol === 'https:';

export const isSafeNotificationHref = (href?: string) => {
  if (!href) return false;

  const trimmedHref = href.trim();
  if (!trimmedHref) return false;
  if (trimmedHref.startsWith('//')) return false;
  if (trimmedHref.startsWith('/')) return true;

  try {
    const parsed = new URL(trimmedHref);
    return isAllowedProtocol(parsed.protocol);
  } catch {
    return false;
  }
};

export type NotificationGroup<T> = {
  label: string;
  items: T[];
};

type NotificationGroupLabelOptions = {
  today?: string;
  yesterday?: string;
  date?: (date: Date) => string;
};

export const getNotificationGroupLabel = (
  date: Date,
  now: Date = new Date(),
  labels: NotificationGroupLabelOptions = {},
) => {
  const dayDate = toDayStart(date);
  const dayNow = toDayStart(now);

  if (isSameDay(dayDate, dayNow)) {
    return labels.today ?? 'Today';
  }

  const yesterday = new Date(dayNow);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(dayDate, yesterday)) {
    return labels.yesterday ?? 'Yesterday';
  }

  return (
    labels.date?.(date) ??
    new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  );
};

export const getNotificationTimeLabel = (date: Date) =>
  new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

type NotificationLike = {
  createdAt: string;
};

const toTimestamp = (value: string) => {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
};

export const groupNotificationsByDate = <T extends NotificationLike>(
  notifications: T[],
  now: Date = new Date(),
  getGroupLabel: (date: Date, now: Date) => string = getNotificationGroupLabel,
): NotificationGroup<T>[] => {
  const validNotifications = notifications
    .map((notification) => {
      const timestamp = toTimestamp(notification.createdAt);
      if (timestamp === null) {
        console.warn(
          '[DashboardShell] Skipping notification with invalid createdAt:',
          notification.createdAt,
        );
        return null;
      }

      return {
        notification,
        timestamp,
      };
    })
    .filter(
      (item): item is { notification: T; timestamp: number } => item !== null,
    )
    .sort((left, right) => right.timestamp - left.timestamp)
    .map((item) => item.notification);

  const groups = new Map<string, T[]>();
  for (const notification of validNotifications) {
    const createdAtDate = new Date(notification.createdAt);
    const label = getGroupLabel(createdAtDate, now);
    const existingGroup = groups.get(label);
    if (existingGroup) {
      existingGroup.push(notification);
      continue;
    }
    groups.set(label, [notification]);
  }

  return Array.from(groups, ([label, items]) => ({ label, items }));
};

type UnreadNotificationLike = {
  id: string;
  unread?: boolean;
};

export const getUnreadNotificationIds = <T extends UnreadNotificationLike>(
  notifications: T[],
) => notifications.filter((item) => item.unread).map((item) => item.id);
