import type { ElementRef, KeyboardEvent, ReactElement, ReactNode } from 'react';
import { cloneElement, forwardRef, isValidElement, useRef } from 'react';
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import { Icon } from '@lumia/icons';
import { cn } from './utils';
import {
  getMenuItemIconClassName,
  menuItemBaseClasses,
  menuItemVariants,
  type MenuItemConfig,
} from './menu-shared';

export type ContextMenuProps = Omit<
  ContextMenuPrimitive.ContextMenuProps,
  'children'
> & {
  items: MenuItemConfig[];
  children: ReactNode;
  contentProps?: Omit<ContextMenuPrimitive.ContextMenuContentProps, 'children'>;
};

const ContextMenuContent = forwardRef<
  ElementRef<typeof ContextMenuPrimitive.Content>,
  Omit<ContextMenuPrimitive.ContextMenuContentProps, 'children'>
>(function ContextMenuContent(
  { className, sideOffset = 8, alignOffset = -2, ...props },
  ref,
) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
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
    </ContextMenuPrimitive.Portal>
  );
});

const ContextMenuItem = forwardRef<
  ElementRef<typeof ContextMenuPrimitive.Item>,
  MenuItemConfig
>(function ContextMenuItem(
  { label, icon, variant = 'default', disabled, onSelect },
  ref,
) {
  return (
    <ContextMenuPrimitive.Item
      ref={ref}
      data-lumia-menu-item
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onSelect={onSelect}
      className={cn(menuItemBaseClasses, menuItemVariants[variant])}
    >
      {icon ? (
        <Icon
          id={icon}
          size={18}
          aria-hidden="true"
          className={getMenuItemIconClassName(variant, disabled)}
        />
      ) : null}
      <span className="flex-1 truncate">{label}</span>
    </ContextMenuPrimitive.Item>
  );
});

export const ContextMenu = ({
  children,
  items,
  contentProps,
  onOpenChange,
  ...props
}: ContextMenuProps) => {
  const triggerRef = useRef<HTMLElement | null>(null);
  const focusTrigger = () => {
    if (!triggerRef.current) return;

    queueMicrotask(() => {
      triggerRef.current?.focus();
    });
  };

  const handleKeyboardOpen = (event: KeyboardEvent<HTMLElement>) => {
    if (
      (event.shiftKey && event.key === 'F10') ||
      event.key === 'ContextMenu'
    ) {
      event.preventDefault();
      const rect = triggerRef.current?.getBoundingClientRect();
      const clientX = rect ? rect.left + rect.width / 2 : 0;
      const clientY = rect ? rect.top + rect.height / 2 : 0;

      triggerRef.current?.dispatchEvent(
        new MouseEvent('contextmenu', {
          bubbles: true,
          clientX,
          clientY,
        }),
      );
    }
  };

  const enhancedChild = isValidElement(children) ? (
    cloneElement(
      children as ReactElement<{
        tabIndex?: number;
        onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
      }>,
      {
        tabIndex:
          (children as { props?: { tabIndex?: number } })?.props?.tabIndex ?? 0,
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
          handleKeyboardOpen(event);
          children.props.onKeyDown?.(event);
        },
      },
    )
  ) : (
    <span tabIndex={0} onKeyDown={handleKeyboardOpen}>
      {children}
    </span>
  );

  return (
    <ContextMenuPrimitive.Root
      {...props}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          focusTrigger();
        }
        onOpenChange?.(nextOpen);
      }}
    >
      <ContextMenuPrimitive.Trigger
        asChild
        ref={(node) => {
          triggerRef.current = node;
        }}
      >
        {enhancedChild}
      </ContextMenuPrimitive.Trigger>
      <ContextMenuContent
        {...contentProps}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          focusTrigger();
          contentProps?.onCloseAutoFocus?.(event);
        }}
      >
        {items.map((item) => (
          <ContextMenuItem
            key={item.id ?? item.label}
            {...item}
            variant={item.variant ?? 'default'}
          />
        ))}
      </ContextMenuContent>
    </ContextMenuPrimitive.Root>
  );
};

export type { MenuItemConfig } from './menu-shared';
