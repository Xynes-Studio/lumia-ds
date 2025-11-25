import type { HTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import {
  LayoutBody,
  LayoutContent,
  LayoutHeader,
  LayoutMain,
  LayoutShell,
  LayoutSidebar,
} from './primitives';

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

        <LayoutBody className="flex-col md:flex-row">
          <div
            data-slot="mobile-sidebar"
            className="flex items-start gap-3 border-b border-border bg-muted/30 px-4 py-4 md:hidden"
          >
            {sidebar}
          </div>

          <LayoutSidebar className="md:w-64 md:flex-shrink-0 md:px-4 md:py-6">
            {sidebar}
          </LayoutSidebar>

          <LayoutMain className="flex-1 min-w-0 overflow-y-auto bg-background">
            <LayoutContent className="w-full">{children}</LayoutContent>
          </LayoutMain>
        </LayoutBody>
      </LayoutShell>
    );
  },
);
