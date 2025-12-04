import type {
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
  ElementType,
} from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/utils';

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type FlexDirection = 'row' | 'row-reverse' | 'col' | 'col-reverse';
type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
type FlexGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type FlexSize = '1' | 'auto' | 'initial' | 'none';
type ResponsiveProp<T extends string | number> =
  | T
  | ({ base?: T } & Partial<Record<Breakpoint, T>>);

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

const flexClasses: Record<FlexSize, string> = {
  '1': 'flex-1',
  auto: 'flex-auto',
  initial: 'flex-initial',
  none: 'flex-none',
};

const shrinkClasses: Record<0 | 1, string> = {
  0: 'shrink-0',
  1: 'shrink',
};

const breakpointPrefixes: Record<Breakpoint, string> = {
  sm: 'sm:',
  md: 'md:',
  lg: 'lg:',
  xl: 'xl:',
  '2xl': '2xl:',
};

type PolymorphicRef<T extends ElementType> = ComponentPropsWithRef<T>['ref'];

const resolveResponsiveClasses = <T extends string | number>({
  value,
  defaultValue,
  classMap,
  includeDefault = true,
}: {
  value?: ResponsiveProp<T>;
  defaultValue?: T;
  classMap: Record<T, string>;
  includeDefault?: boolean;
}): string[] => {
  if (value === undefined) {
    return includeDefault && defaultValue !== undefined
      ? [classMap[defaultValue as T & string]]
      : [];
  }

  if (typeof value !== 'object' || value === null) {
    return [classMap[value as T]];
  }

  const classes: string[] = [];
  const responsiveValue = value as { base?: T } & Partial<
    Record<Breakpoint, T>
  >;

  const baseValue =
    'base' in responsiveValue
      ? (responsiveValue.base as T | undefined)
      : includeDefault
        ? defaultValue
        : undefined;

  if (baseValue !== undefined) {
    classes.push(classMap[baseValue as T & string]);
  }

  for (const breakpoint of Object.keys(breakpointPrefixes) as Breakpoint[]) {
    const breakpointValue = responsiveValue[breakpoint];

    if (breakpointValue !== undefined) {
      classes.push(
        `${breakpointPrefixes[breakpoint]}${classMap[breakpointValue as T & string]}`,
      );
    }
  }

  return classes;
};

export type FlexProps<T extends ElementType = 'div'> =
  ComponentPropsWithoutRef<T> & {
    as?: T;
    direction?: ResponsiveProp<FlexDirection>;
    align?: ResponsiveProp<FlexAlign>;
    justify?: ResponsiveProp<FlexJustify>;
    wrap?: ResponsiveProp<FlexWrap>;
    gap?: ResponsiveProp<FlexGap>;
    flex?: ResponsiveProp<FlexSize>;
    shrink?: ResponsiveProp<0 | 1>;
    inline?: boolean;
    hiddenUntil?: Breakpoint;
  };

function FlexInner<T extends ElementType = 'div'>(
  {
    as,
    direction = 'row',
    align = 'stretch',
    justify = 'start',
    wrap = 'nowrap',
    gap = 'none',
    flex,
    shrink,
    inline = false,
    hiddenUntil,
    className,
    ...props
  }: FlexProps<T>,
  ref: PolymorphicRef<T>,
) {
  const Component = as ?? 'div';
  const displayClass = hiddenUntil
    ? cn(
        'hidden',
        `${breakpointPrefixes[hiddenUntil]}${inline ? 'inline-flex' : 'flex'}`,
      )
    : inline
      ? 'inline-flex'
      : 'flex';

  return (
    <Component
      ref={ref}
      className={cn(
        displayClass,
        ...resolveResponsiveClasses({
          value: direction,
          defaultValue: 'row',
          classMap: directionClasses,
        }),
        ...resolveResponsiveClasses({
          value: align,
          defaultValue: 'stretch',
          classMap: alignClasses,
        }),
        ...resolveResponsiveClasses({
          value: justify,
          defaultValue: 'start',
          classMap: justifyClasses,
        }),
        ...resolveResponsiveClasses({
          value: wrap,
          defaultValue: 'nowrap',
          classMap: wrapClasses,
        }),
        ...resolveResponsiveClasses({
          value: gap,
          defaultValue: 'none',
          classMap: gapClasses,
        }),
        ...resolveResponsiveClasses({
          value: flex,
          classMap: flexClasses,
          includeDefault: false,
        }),
        ...resolveResponsiveClasses({
          value: shrink,
          classMap: shrinkClasses,
          includeDefault: false,
        }),
        className,
      )}
      {...props}
    />
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FlexWithRef = forwardRef(FlexInner as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(FlexWithRef as any).displayName = 'Flex';

export const Flex = FlexWithRef;
