import type {
  ComponentPropsWithoutRef,
  ElementRef,
  MutableRefObject,
  ReactNode,
} from 'react';
import { createContext, forwardRef, useContext, useRef } from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from './utils';

export type MenuProps = DropdownMenuPrimitive.DropdownMenuProps;

const MenuInternalContext =
  createContext<MutableRefObject<HTMLElement | null> | null>(null);

const useMenuInternalContext = (component: string) => {
  const context = useContext(MenuInternalContext);
  if (!context) {
    throw new Error(`${component} must be used within Menu`);
  }
  return context;
};

export const Menu = ({ children, onOpenChange, ...props }: MenuProps) => {
  const triggerRef = useRef<HTMLElement | null>(null);

  return (
    <MenuInternalContext.Provider value={triggerRef}>
      <DropdownMenuPrimitive.Root
        {...props}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            triggerRef.current?.focus();
          }
          onOpenChange?.(nextOpen);
        }}
      >
        {children}
      </DropdownMenuPrimitive.Root>
    </MenuInternalContext.Provider>
  );
};

export type MenuTriggerProps = DropdownMenuPrimitive.DropdownMenuTriggerProps;

export const MenuTrigger = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Trigger>,
  MenuTriggerProps
>(function MenuTrigger({ asChild = true, ...props }, ref) {
  const triggerRef = useMenuInternalContext('MenuTrigger');

  return (
    <DropdownMenuPrimitive.Trigger
      ref={(node) => {
        triggerRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      asChild={asChild}
      {...props}
    />
  );
});

export type MenuContentProps = DropdownMenuPrimitive.DropdownMenuContentProps;

export const MenuContent = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Content>,
  MenuContentProps
>(function MenuContent(
  { className, sideOffset = 8, alignOffset = -2, ...props },
  ref,
) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        data-lumia-menu-content
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className={cn(
          'z-50 min-w-[12rem] rounded-md border border-border bg-background p-1 text-sm text-foreground shadow-lg focus:outline-none',
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
});

export type MenuItemProps = Omit<
  DropdownMenuPrimitive.DropdownMenuItemProps,
  'children'
> & {
  label: string;
  icon?: ReactNode;
  children?: ReactNode;
};

export const MenuItem = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Item>,
  MenuItemProps
>(function MenuItem({ className, icon, label, children, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      data-lumia-menu-item
      className={cn(
        'relative flex cursor-pointer select-none items-center gap-3 rounded-md px-3 py-2 font-medium outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-muted focus:text-foreground data-[highlighted]:bg-muted data-[highlighted]:text-foreground',
        className,
      )}
      {...props}
    >
      {icon ? (
        <span className="text-muted inline-flex h-5 w-5 shrink-0 items-center justify-center">
          {icon}
        </span>
      ) : null}
      <span className="flex-1 truncate">{children ?? label}</span>
    </DropdownMenuPrimitive.Item>
  );
});

export type MenuSeparatorProps = ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Separator
>;

export const MenuSeparator = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Separator>,
  MenuSeparatorProps
>(function MenuSeparator({ className, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      data-lumia-menu-separator
      className={cn('my-1 h-px bg-border', className)}
      {...props}
    />
  );
});
