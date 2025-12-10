import { Flex, type FlexProps } from '@lumia-ui/components';
import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';

const cx = (...classes: Array<string | undefined | false | null>) =>
  classes.filter(Boolean).join(' ');

type LayoutFlexProps = Pick<
  FlexProps,
  'align' | 'direction' | 'gap' | 'justify' | 'wrap'
>;

export type LayoutShellProps = HTMLAttributes<HTMLDivElement>;

export const LayoutShell = forwardRef<HTMLDivElement, LayoutShellProps>(
  function LayoutShell({ children, className, ...props }, ref) {
    return (
      <Flex
        ref={ref}
        direction="col"
        className={cx('min-h-screen bg-background text-foreground', className)}
        {...props}
      >
        {children}
      </Flex>
    );
  },
);

export type LayoutHeaderProps = HTMLAttributes<HTMLDivElement>;

export const LayoutHeader = forwardRef<HTMLDivElement, LayoutHeaderProps>(
  function LayoutHeader({ children, className, ...props }, ref) {
    return (
      <Flex
        ref={ref}
        as="header"
        align="center"
        justify="between"
        gap="sm"
        className={cx(
          'border-b border-border bg-background/80 px-6 py-4 backdrop-blur supports-[backdrop-filter]:backdrop-blur',
          className,
        )}
        {...props}
      >
        {children}
      </Flex>
    );
  },
);

export type LayoutBodyProps = HTMLAttributes<HTMLDivElement> & LayoutFlexProps;

export const LayoutBody = forwardRef<HTMLDivElement, LayoutBodyProps>(
  function LayoutBody(
    { children, className, direction, align, justify, gap, wrap, ...props },
    ref,
  ) {
    return (
      <Flex
        ref={ref}
        direction={direction}
        align={align}
        justify={justify}
        gap={gap}
        wrap={wrap}
        flex="1"
        className={cx('min-h-0 bg-background', className)}
        {...props}
      >
        {children}
      </Flex>
    );
  },
);

export type LayoutSidebarProps = HTMLAttributes<HTMLDivElement> & {
  collapsed?: boolean;
  shrink?: FlexProps['shrink'];
};

export const LayoutSidebar = forwardRef<HTMLDivElement, LayoutSidebarProps>(
  function LayoutSidebar(
    { children, className, collapsed = false, shrink, ...props },
    ref,
  ) {
    return (
      <Flex
        ref={ref}
        as="aside"
        data-collapsed={collapsed}
        direction="col"
        shrink={shrink}
        hiddenUntil="md"
        className={cx(
          'border-r border-border bg-muted/40 transition-[width,transform] duration-200',
          collapsed ? 'w-20' : 'w-64',
          className,
        )}
        {...props}
      >
        {children}
      </Flex>
    );
  },
);

export type LayoutMainProps = HTMLAttributes<HTMLDivElement>;

export const LayoutMain = forwardRef<HTMLDivElement, LayoutMainProps>(
  function LayoutMain({ children, className, ...props }, ref) {
    return (
      <Flex
        ref={ref}
        as="main"
        direction="col"
        flex="1"
        className={cx(
          'overflow-hidden bg-background text-foreground',
          className,
        )}
        {...props}
      >
        {children}
      </Flex>
    );
  },
);

export type LayoutContentProps = HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
};

export const LayoutContent = forwardRef<HTMLDivElement, LayoutContentProps>(
  function LayoutContent(
    { children, className, padded = true, ...props },
    ref,
  ) {
    return (
      <Flex
        ref={ref}
        direction="col"
        gap="lg"
        className={cx('mx-auto max-w-6xl', padded && 'px-6 py-6', className)}
        {...props}
      >
        {children}
      </Flex>
    );
  },
);

export type LayoutFooterProps = HTMLAttributes<HTMLDivElement>;

export const LayoutFooter = forwardRef<HTMLDivElement, LayoutFooterProps>(
  function LayoutFooter({ children, className, ...props }, ref) {
    return (
      <footer
        ref={ref}
        className={cx(
          'border-t border-border bg-background px-6 py-4 text-sm text-muted-foreground -foreground',
          className,
        )}
        {...props}
      >
        {children}
      </footer>
    );
  },
);
