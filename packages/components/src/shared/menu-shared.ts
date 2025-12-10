import type { IconId } from '@lumia-ui/icons';
import { cn } from '../lib/utils';

export type MenuItemBase = {
  label: string;
  icon?: IconId;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
  isLoading?: boolean;
};

export type MenuItemConfig = MenuItemBase & {
  id?: string;
  onSelect?: () => void;
};

export const menuItemBaseClasses =
  'relative flex w-full cursor-default select-none items-center gap-3 rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[disabled]:text-muted-foreground';

export const menuItemVariants = {
  default:
    'text-foreground hover:bg-muted focus:bg-muted data-[highlighted]:bg-muted data-[highlighted]:text-foreground',
  destructive:
    'text-destructive hover:bg-destructive/10 focus:bg-destructive/10 data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive',
} satisfies Record<NonNullable<MenuItemBase['variant']>, string>;

export const getMenuItemIconClassName = (
  variant: MenuItemBase['variant'],
  disabled?: boolean,
) =>
  cn(
    'shrink-0',
    variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground',
    disabled && 'text-muted-foreground',
  );
