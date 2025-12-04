import type { HTMLAttributes, ReactElement, ReactNode } from 'react';
import { cn } from './utils';

type ToolbarAlign = 'start' | 'center' | 'end';
type ToolbarGap = 'sm' | 'md' | 'lg';

const alignClasses: Record<ToolbarAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
};

const gapClasses: Record<ToolbarGap, string> = {
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
};

export type ToolbarProps = HTMLAttributes<HTMLDivElement> & {
  align?: ToolbarAlign;
  gap?: ToolbarGap;
  left?: ReactNode;
  right?: ReactNode;
};

export const Toolbar = ({
  align = 'center',
  gap = 'md',
  left,
  right,
  children,
  className,
  ...props
}: ToolbarProps): ReactElement => {
  const alignClass = alignClasses[align];
  const gapClass = gapClasses[gap];

  const hasLeftContent = left != null || children != null;
  const hasRightContent = right != null;

  return (
    <div
      className={cn(
        'flex w-full flex-col sm:flex-row sm:items-center sm:justify-between',
        alignClass,
        gapClass,
        className,
      )}
      {...props}
    >
      {hasLeftContent ? (
        <div
          className={cn(
            'flex w-full flex-wrap sm:flex-1 sm:min-w-0',
            alignClass,
            gapClass,
          )}
        >
          {left ?? children}
        </div>
      ) : null}
      {hasRightContent ? (
        <div
          className={cn(
            'flex w-full flex-wrap sm:w-auto sm:flex-none sm:justify-end',
            alignClass,
            gapClass,
          )}
        >
          {right}
        </div>
      ) : null}
    </div>
  );
};
