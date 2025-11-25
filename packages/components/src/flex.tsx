import type {
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
  ElementType,
  ReactElement,
} from 'react';
import { forwardRef } from 'react';
import { cn } from './utils';

type FlexDirection = 'row' | 'row-reverse' | 'col' | 'col-reverse';
type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
type FlexGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const directionClasses: Record<FlexDirection, string> = {
  row: 'flex-row',
  'row-reverse': 'flex-row-reverse',
  col: 'flex-col',
  'col-reverse': 'flex-col-reverse',
};

const alignClasses: Record<FlexAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const justifyClasses: Record<FlexJustify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const wrapClasses: Record<FlexWrap, string> = {
  nowrap: 'flex-nowrap',
  wrap: 'flex-wrap',
  'wrap-reverse': 'flex-wrap-reverse',
};

const gapClasses: Record<FlexGap, string> = {
  none: 'gap-0',
  xs: 'gap-2',
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

type PolymorphicRef<T extends ElementType> = ComponentPropsWithRef<T>['ref'];

export type FlexProps<T extends ElementType = 'div'> =
  ComponentPropsWithoutRef<T> & {
    as?: T;
    direction?: FlexDirection;
    align?: FlexAlign;
    justify?: FlexJustify;
    wrap?: FlexWrap;
    gap?: FlexGap;
  };

type FlexComponent = <T extends ElementType = 'div'>(
  props: FlexProps<T> & { ref?: PolymorphicRef<T> },
) => ReactElement | null;

export const Flex = forwardRef(function Flex<T extends ElementType = 'div'>(
  {
    as,
    direction = 'row',
    align = 'stretch',
    justify = 'start',
    wrap = 'nowrap',
    gap = 'none',
    className,
    ...props
  }: FlexProps<T>,
  ref: PolymorphicRef<T>,
) {
  const Component = as ?? 'div';

  return (
    <Component
      ref={ref}
      className={cn(
        'flex',
        directionClasses[direction],
        alignClasses[align],
        justifyClasses[justify],
        wrapClasses[wrap],
        gapClasses[gap],
        className,
      )}
      {...props}
    />
  );
}) as FlexComponent;
