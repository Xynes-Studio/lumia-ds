import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ForwardedRef,
  MutableRefObject,
} from 'react';
import { forwardRef } from 'react';
import { Icon, type IconId } from '@lumia/icons';
import { cn } from '../lib/utils';

type SideNavItemBase = {
  label: string;
  icon?: IconId;
  active?: boolean;
  badgeCount?: number;
};

type SideNavItemLinkProps = SideNavItemBase &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & {
    href: string;
  };

type SideNavItemButtonProps = SideNavItemBase &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
    href?: undefined;
  };

export type SideNavItemProps = SideNavItemLinkProps | SideNavItemButtonProps;

const baseClasses =
  'group inline-flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ring-offset-background';
const inactiveClasses =
  'text-muted-foreground hover:bg-muted hover:text-foreground';
const activeClasses =
  'bg-primary/10 text-primary-800 hover:bg-primary/20 focus-visible:ring-primary-600';

const badgeClasses =
  'ml-auto inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-muted px-2 text-xs font-semibold text-foreground';
const activeBadgeClasses = 'bg-primary text-secondary';

const renderContent = (
  label: string,
  icon?: IconId,
  badgeCount?: number,
  active?: boolean,
) => {
  const showBadge = typeof badgeCount === 'number' && badgeCount > 0;

  return (
    <>
      {icon ? (
        <Icon
          name={icon}
          size={18}
          aria-hidden="true"
          className={cn('shrink-0', active && 'text-primary-800')}
        />
      ) : null}
      <span className="flex-1 truncate">{label}</span>
      {showBadge ? (
        <span
          className={cn(badgeClasses, active && activeBadgeClasses)}
          aria-label={`${badgeCount} new items`}
        >
          {badgeCount}
        </span>
      ) : null}
    </>
  );
};

const setRef = <T extends HTMLElement>(
  ref: ForwardedRef<HTMLAnchorElement | HTMLButtonElement>,
  value: T | null,
) => {
  if (typeof ref === 'function') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref(value as any);
  } else if (ref) {
    (ref as MutableRefObject<T | null>).current = value;
  }
};

export const SideNavItem = forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  SideNavItemProps
>(function SideNavItem(
  { label, icon, active = false, badgeCount, className, ...props },
  ref,
) {
  const sharedClassName = cn(
    baseClasses,
    active ? activeClasses : inactiveClasses,
    className,
  );
  const sharedStateProps = {
    'data-active': active ? 'true' : undefined,
    'aria-current': active ? 'page' : undefined,
  } as const;

  if ('href' in props && props.href) {
    const { href, ...anchorProps } = props as SideNavItemLinkProps;

    return (
      <a
        {...anchorProps}
        {...sharedStateProps}
        ref={(node) => setRef(ref, node)}
        href={href}
        className={sharedClassName}
      >
        {renderContent(label, icon, badgeCount, active)}
      </a>
    );
  }

  const { type = 'button', ...buttonProps } = props as SideNavItemButtonProps;

  return (
    <button
      {...buttonProps}
      {...sharedStateProps}
      ref={(node) => setRef(ref, node)}
      type={type}
      className={sharedClassName}
    >
      {renderContent(label, icon, badgeCount, active)}
    </button>
  );
});
