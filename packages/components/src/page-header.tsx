import type { HTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import { Breadcrumbs, type BreadcrumbItem } from './breadcrumbs';
import { Toolbar } from './toolbar';
import { cn } from './utils';

export type PageHeaderProps = HTMLAttributes<HTMLElement> & {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode | ReactNode[];
};

export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(
  function PageHeader(
    {
      title,
      subtitle,
      breadcrumbs,
      primaryAction,
      secondaryActions,
      className,
      ...props
    },
    ref,
  ) {
    const secondaryList = secondaryActions
      ? Array.isArray(secondaryActions)
        ? secondaryActions
        : [secondaryActions]
      : [];
    const hasActions = Boolean(primaryAction || secondaryList.length > 0);

    return (
      <header
        ref={ref}
        className={cn('flex flex-col gap-3 sm:gap-4', className)}
        {...props}
      >
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <Breadcrumbs items={breadcrumbs} />
        ) : null}

        <Toolbar
          align="start"
          gap="md"
          left={
            <div className="flex min-w-0 flex-col gap-1">
              <h1 className="truncate text-2xl font-semibold leading-7 tracking-tight text-foreground sm:text-3xl sm:leading-8">
                {title}
              </h1>
              {subtitle ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  {subtitle}
                </p>
              ) : null}
            </div>
          }
          right={
            hasActions ? (
              <div
                data-page-header-actions
                className="flex flex-wrap items-center justify-end gap-2"
              >
                {secondaryList.map((action, index) => (
                  <div key={`secondary-action-${index}`}>{action}</div>
                ))}
                {primaryAction ? (
                  <div className="flex items-center">{primaryAction}</div>
                ) : null}
              </div>
            ) : null
          }
        />
      </header>
    );
  },
);
