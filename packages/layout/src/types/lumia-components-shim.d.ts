declare module '@lumia-ui/components' {
  import type { ReactNode } from 'react';

  type ComponentLike = (props: Record<string, unknown>) => ReactNode;
  type HTMLElementLike = { focus?: () => void };

  export type FlexProps = {
    [key: string]: unknown;
    align?: unknown;
    direction?: unknown;
    gap?: unknown;
    justify?: unknown;
    wrap?: unknown;
    flex?: unknown;
    shrink?: unknown;
    hiddenUntil?: unknown;
    as?: unknown;
  };

  export const Flex: ComponentLike;
  export const Avatar: ComponentLike;
  export const Badge: ComponentLike;
  export const Button: ComponentLike;
  export const Card: ComponentLike;
  export const CardContent: ComponentLike;
  export const CardHeader: ComponentLike;
  export const Menu: ComponentLike;
  export const MenuContent: ComponentLike;
  export const MenuItem: ComponentLike;
  export const MenuLabel: ComponentLike;
  export const MenuSeparator: ComponentLike;
  export const MenuTrigger: ComponentLike;
  export const Sheet: ComponentLike;
  export const SheetContent: ComponentLike;
  export const SheetHeader: ComponentLike;
  export const SheetTitle: ComponentLike;
  export const SheetDescription: ComponentLike;
  export const SheetTrigger: ComponentLike;
  export const Drawer: ComponentLike;
  export type DrawerProps = {
    restoreFocusElement?: HTMLElementLike | null;
  };
  export const DrawerHeader: ComponentLike;
  export const DrawerTitle: ComponentLike;
  export const Tooltip: ComponentLike;
  export const TooltipContent: ComponentLike;
  export const TooltipProvider: ComponentLike;
  export const TooltipTrigger: ComponentLike;
  export const SideNavItem: ComponentLike;
  export type DirectoryTreeNode = {
    id: string;
    label: string;
    href?: string;
    children?: DirectoryTreeNode[];
  };
  export const DirectoryTreeNav: ComponentLike;
}
