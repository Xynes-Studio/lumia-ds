import type { HTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import { Flex } from '@lumia-ui/components';

const cx = (...classes: Array<string | undefined | false | null>) =>
  classes.filter(Boolean).join(' ');

export type StackLayoutProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export const StackLayout = forwardRef<HTMLDivElement, StackLayoutProps>(
  function StackLayout({ title, actions, children, className, ...props }, ref) {
    return (
      <Flex
        ref={ref}
        direction="col"
        className={cx('min-h-screen bg-background text-foreground', className)}
        {...props}
      >
        {(title || actions) && (
          <div
            data-slot="stack-header"
            className="sticky top-0 z-10 border-b border-border/80 bg-background/80 px-6 py-5 backdrop-blur supports-[backdrop-filter]:backdrop-blur"
          >
            <Flex
              direction={{ base: 'col', md: 'row' }}
              align={{ md: 'center' }}
              justify={{ md: 'between' }}
              gap="sm"
              className="mx-auto w-full max-w-6xl"
            >
              {title ? (
                <h1 className="text-xl font-semibold leading-7 tracking-tight">
                  {title}
                </h1>
              ) : (
                <span className="sr-only">Stack layout</span>
              )}

              {actions && (
                <Flex
                  data-slot="stack-actions"
                  align="center"
                  wrap="wrap"
                  gap="sm"
                >
                  {actions}
                </Flex>
              )}
            </Flex>
          </div>
        )}

        <Flex
          direction="col"
          flex="1"
          className="bg-gradient-to-b from-background via-background to-muted/30"
        >
          <Flex
            data-slot="stack-body"
            direction="col"
            gap="lg"
            className="mx-auto w-full max-w-5xl px-6 py-6"
          >
            <Flex direction="col" gap="md">
              {children}
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    );
  },
);
