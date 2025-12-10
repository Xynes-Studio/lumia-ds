import type { HTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import { Flex } from '@lumia-ui/components';
import {
  LayoutBody,
  LayoutContent,
  LayoutHeader,
  LayoutMain,
  LayoutShell,
  LayoutSidebar,
} from '../primitives/primitives';

const cx = (...classes: Array<string | undefined | false | null>) =>
  classes.filter(Boolean).join(' ');

export type AdminShellProps = HTMLAttributes<HTMLDivElement> & {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
};

export const AdminShell = forwardRef<HTMLDivElement, AdminShellProps>(
  function AdminShell({ sidebar, header, children, className, ...props }, ref) {
    return (
      <LayoutShell
        ref={ref}
        className={cx('bg-background text-foreground', className)}
        {...props}
      >
        <LayoutHeader>{header}</LayoutHeader>

        <LayoutBody direction={{ base: 'col', md: 'row' }}>
          <Flex
            data-slot="mobile-sidebar"
            align="start"
            gap="sm"
            className="border-b border-border bg-muted/30 px-4 py-4 md:hidden"
          >
            {sidebar}
          </Flex>

          <LayoutSidebar shrink={{ md: 0 }} className="md:w-64 md:px-4 md:py-6">
            {sidebar}
          </LayoutSidebar>

          <LayoutMain className="min-w-0 overflow-y-auto bg-background">
            <LayoutContent className="w-full">{children}</LayoutContent>
          </LayoutMain>
        </LayoutBody>
      </LayoutShell>
    );
  },
);
