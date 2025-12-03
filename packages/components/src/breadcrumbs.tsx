import type { HTMLAttributes } from 'react';
import { Icon, type IconId } from '@lumia/icons';
import { cn } from './utils';

export type BreadcrumbItem = {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: IconId;
};

export type BreadcrumbsProps = HTMLAttributes<HTMLElement> & {
  items: BreadcrumbItem[];
  /**
   * When set and the total items exceed this count, middle items collapse into an ellipsis.
   * A minimum of 3 visible nodes (first, ellipsis, last) is enforced.
   */
  maxItems?: number;
};

type VisibleItem = BreadcrumbItem | { type: 'ellipsis' };

const isEllipsis = (item: VisibleItem): item is { type: 'ellipsis' } =>
  'type' in item && item.type === 'ellipsis';

const baseCrumbClasses =
  'inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors';
const interactiveCrumbClasses =
  'hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ring-offset-background';

const buildVisibleItems = (
  items: BreadcrumbItem[],
  maxItems?: number,
): VisibleItem[] => {
  if (!maxItems || items.length <= maxItems) return items;

  const clampedMax = Math.max(3, Math.floor(maxItems));
  if (items.length <= clampedMax) return items;

  const trailingCount = clampedMax - 2;
  const trailingStart = Math.max(items.length - trailingCount, 1);

  return [items[0], { type: 'ellipsis' }, ...items.slice(trailingStart)];
};

export function Breadcrumbs({
  items,
  maxItems,
  className,
  ...props
}: BreadcrumbsProps) {
  const visibleItems = buildVisibleItems(items, maxItems);
  const currentItem = items[items.length - 1];

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'flex items-center text-sm text-muted-foreground',
        className,
      )}
      {...props}
    >
      <ol className="flex flex-wrap items-center gap-1">
        {visibleItems.map((item, index) => {
          const key = isEllipsis(item)
            ? `ellipsis-${index}`
            : `${item.label}-${index}`;
          const isLastVisible = index === visibleItems.length - 1;
          const isCurrent = !isEllipsis(item) && item === currentItem;

          return (
            <li key={key} className="flex items-center gap-1">
              {isEllipsis(item) ? (
                <span
                  aria-hidden="true"
                  data-breadcrumb-ellipsis
                  className="px-2 py-1"
                >
                  ...
                </span>
              ) : (
                <Crumb
                  item={item}
                  isCurrent={isCurrent}
                  isInteractive={Boolean(item.href || item.onClick)}
                />
              )}
              {!isLastVisible ? (
                <span className="text-muted-foreground">/</span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

type CrumbProps = {
  item: BreadcrumbItem;
  isCurrent: boolean;
  isInteractive: boolean;
};

const Crumb = ({ item, isCurrent, isInteractive }: CrumbProps) => {
  const content = (
    <>
      {item.icon ? (
        <Icon id={item.icon} size={16} className="shrink-0" />
      ) : null}
      <span>{item.label}</span>
    </>
  );

  const crumbClasses = cn(
    baseCrumbClasses,
    isInteractive && interactiveCrumbClasses,
    isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground',
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        onClick={item.onClick}
        className={crumbClasses}
        aria-current={isCurrent ? 'page' : undefined}
      >
        {content}
      </a>
    );
  }

  if (item.onClick) {
    return (
      <button
        type="button"
        onClick={item.onClick}
        className={crumbClasses}
        aria-current={isCurrent ? 'page' : undefined}
      >
        {content}
      </button>
    );
  }

  return (
    <span
      className={crumbClasses}
      aria-current={isCurrent ? 'page' : undefined}
    >
      {content}
    </span>
  );
};
