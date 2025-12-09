import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { Icon, type IconId } from '@lumia-ui/icons';
import { Card } from '../card/card';
import { cn } from '../lib/utils';

export type StatTileDelta = {
  value: number;
  direction: 'up' | 'down';
};

export type StatTileProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  value: string | number;
  delta?: StatTileDelta;
  icon?: IconId;
};

const tileClasses = 'h-full';
const contentClasses = 'flex h-full min-w-0 flex-col gap-3 p-4 sm:p-5';
const labelClasses = 'text-sm font-medium leading-6 text-muted-foreground';
const valueClasses =
  'text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl';

const deltaBaseClasses =
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium leading-5';
const deltaVariantClasses = {
  up: 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-50',
  down: 'border-red-100 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-50',
};

const iconWrapperClasses =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground';

const formatDeltaValue = (
  value: number,
  direction: StatTileDelta['direction'],
) => `${direction === 'up' ? '+' : '-'}${Math.abs(value)}`;

export const StatTile = forwardRef<HTMLDivElement, StatTileProps>(
  function StatTile({ label, value, delta, icon, className, ...props }, ref) {
    return (
      <Card
        ref={ref}
        data-lumia-stat-tile
        className={cn(tileClasses, className)}
        {...props}
      >
        <div className={contentClasses}>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className={labelClasses}>{label}</p>
              <div className="flex items-baseline gap-3">
                <span className={valueClasses}>{value}</span>
                {delta ? (
                  <span
                    data-lumia-stat-tile-delta
                    data-direction={delta.direction}
                    className={cn(
                      deltaBaseClasses,
                      deltaVariantClasses[delta.direction],
                    )}
                  >
                    <Icon
                      name={
                        delta.direction === 'up' ? 'chevron-up' : 'chevron-down'
                      }
                      size={16}
                      aria-hidden="true"
                      className="fill-none"
                    />
                    <span>
                      {formatDeltaValue(delta.value, delta.direction)}
                    </span>
                  </span>
                ) : null}
              </div>
            </div>
            {icon ? (
              <span className={iconWrapperClasses} aria-hidden="true">
                <Icon name={icon} size={20} className="fill-none" />
              </span>
            ) : null}
          </div>
        </div>
      </Card>
    );
  },
);
