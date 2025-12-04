import type { ComponentProps } from 'react';
import { describe, expect, expectTypeOf, it } from 'vitest';
import type * as ExternalApi from '@lumia/components';
import {
  Button,
  buttonStyles,
  type ButtonProps,
  ConfirmDialog,
  useConfirmDialog,
  type ConfirmDialogProps,
  type UseConfirmDialogResult,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  type CardContentProps,
  type CardDescriptionProps,
  type CardFooterProps,
  type CardHeaderProps,
  type CardProps,
  type CardTitleProps,
  Checkbox,
  type CheckboxProps,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  type DialogContentProps,
  type DialogDescriptionProps,
  type DialogFooterProps,
  type DialogHeaderProps,
  type DialogProps,
  type DialogTitleProps,
  type DialogTriggerProps,
  DateRangeFilter,
  type DateRangeFilterProps,
  type DateRangePreset,
  type DateRangeValue,
  EmptyState,
  type EmptyStateAction,
  type EmptyStateProps,
  NoResults,
  type NoResultsProps,
  Input,
  Textarea,
  NumberInput,
  Combobox,
  type InputProps,
  type TextareaProps,
  type NumberInputProps,
  type ComboboxProps,
  type ComboboxOption,
  FileUpload,
  type FileUploadProps,
  type UploadedFile,
  Radio,
  type RadioProps,
  Select,
  type SelectProps,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  type SheetContentProps,
  type SheetDescriptionProps,
  type SheetFooterProps,
  type SheetHeaderProps,
  type SheetProps,
  type SheetTitleProps,
  type SheetTriggerProps,
  ContextMenu,
  type ContextMenuProps,
  type MenuItemConfig,
  Menu,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuTrigger,
  type MenuContentProps,
  type MenuItemProps,
  type MenuLabelProps,
  type MenuProps,
  type MenuSeparatorProps,
  type MenuTriggerProps,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  type TabsContentProps,
  type TabsListProps,
  type TabsProps,
  type TabsTriggerProps,
  SegmentedControl,
  type SegmentedControlOption,
  type SegmentedControlProps,
  Flex,
  type FlexProps,
  FlatList,
  type FlatListProps,
  Pagination,
  type PaginationProps,
  SideNavItem,
  type SideNavItemProps,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  type TableBodyProps,
  type TableCellProps,
  type TableHeaderProps,
  type TableColumn,
  type TableSortDirection,
  type TableSortState,
  type TableProps,
  type TableRowProps,
  ToastProvider,
  ToastViewport,
  useToast,
  type ToastAction,
  type ToastOptions,
  type ToastProviderProps,
  type ToastVariant,
  Skeleton,
  type SkeletonProps,
} from './index';

describe('components index barrel', () => {
  it('exports all primitives and helpers', () => {
    expect(Button).toBeDefined();
    expect(buttonStyles.base).toBeDefined();
    expect(Input).toBeDefined();
    expect(Textarea).toBeDefined();
    expect(NumberInput).toBeDefined();
    expect(Combobox).toBeDefined();
    expect(Select).toBeDefined();
    expect(Checkbox).toBeDefined();
    expect(Radio).toBeDefined();
    expect(FileUpload).toBeDefined();
    expect(DateRangeFilter).toBeDefined();

    expect(Card).toBeDefined();
    expect(CardHeader).toBeDefined();
    expect(CardTitle).toBeDefined();
    expect(CardDescription).toBeDefined();
    expect(CardContent).toBeDefined();
    expect(CardFooter).toBeDefined();

    expect(Tabs).toBeDefined();
    expect(TabsList).toBeDefined();
    expect(TabsTrigger).toBeDefined();
    expect(TabsContent).toBeDefined();
    expect(SegmentedControl).toBeDefined();

    expect(Dialog).toBeDefined();
    expect(DialogTrigger).toBeDefined();
    expect(DialogContent).toBeDefined();
    expect(DialogHeader).toBeDefined();
    expect(DialogTitle).toBeDefined();
    expect(DialogDescription).toBeDefined();
    expect(DialogFooter).toBeDefined();
    expect(ConfirmDialog).toBeDefined();
    expect(useConfirmDialog).toBeDefined();

    expect(Sheet).toBeDefined();
    expect(SheetTrigger).toBeDefined();
    expect(SheetContent).toBeDefined();
    expect(SheetHeader).toBeDefined();
    expect(SheetTitle).toBeDefined();
    expect(SheetDescription).toBeDefined();
    expect(SheetFooter).toBeDefined();

    expect(ContextMenu).toBeDefined();
    expect(Menu).toBeDefined();
    expect(MenuTrigger).toBeDefined();
    expect(MenuContent).toBeDefined();
    expect(MenuItem).toBeDefined();
    expect(MenuLabel).toBeDefined();
    expect(MenuSeparator).toBeDefined();

    expect(Flex).toBeDefined();
    expect(FlatList).toBeDefined();
    expect(Pagination).toBeDefined();
    expect(SideNavItem).toBeDefined();
    expect(Table).toBeDefined();
    expect(TableHeader).toBeDefined();
    expect(TableBody).toBeDefined();
    expect(TableRow).toBeDefined();
    expect(TableCell).toBeDefined();
    expect(EmptyState).toBeDefined();
    expect(NoResults).toBeDefined();
    expect(ToastProvider).toBeDefined();
    expect(ToastViewport).toBeDefined();
    expect(useToast).toBeDefined();
    expect(Skeleton).toBeDefined();
  });

  it('provides consumer friendly prop types', () => {
    expectTypeOf<ButtonProps>().toMatchTypeOf<ComponentProps<typeof Button>>();
    expectTypeOf<InputProps>().toMatchTypeOf<ComponentProps<typeof Input>>();
    expectTypeOf<TextareaProps>().toMatchTypeOf<
      ComponentProps<typeof Textarea>
    >();
    expectTypeOf<NumberInputProps>().toMatchTypeOf<
      ComponentProps<typeof NumberInput>
    >();
    expectTypeOf<ComboboxProps>().toMatchTypeOf<
      ComponentProps<typeof Combobox>
    >();
    expectTypeOf<ComboboxOption>().toMatchTypeOf<ComboboxOption>();
    expectTypeOf<FileUploadProps>().toMatchTypeOf<
      ComponentProps<typeof FileUpload>
    >();
    expectTypeOf<UploadedFile>().toMatchTypeOf<UploadedFile>();
    expectTypeOf<SelectProps>().toMatchTypeOf<ComponentProps<typeof Select>>();
    expectTypeOf<CheckboxProps>().toMatchTypeOf<
      ComponentProps<typeof Checkbox>
    >();
    expectTypeOf<RadioProps>().toMatchTypeOf<ComponentProps<typeof Radio>>();
    expectTypeOf<DateRangeFilterProps>().toMatchTypeOf<
      ComponentProps<typeof DateRangeFilter>
    >();
    expectTypeOf<DateRangeValue>().toMatchTypeOf<DateRangeValue>();
    expectTypeOf<DateRangePreset>().toMatchTypeOf<DateRangePreset>();

    expectTypeOf<CardProps>().toMatchTypeOf<ComponentProps<typeof Card>>();
    expectTypeOf<CardHeaderProps>().toMatchTypeOf<
      ComponentProps<typeof CardHeader>
    >();
    expectTypeOf<CardTitleProps>().toMatchTypeOf<
      ComponentProps<typeof CardTitle>
    >();
    expectTypeOf<CardDescriptionProps>().toMatchTypeOf<
      ComponentProps<typeof CardDescription>
    >();
    expectTypeOf<CardContentProps>().toMatchTypeOf<
      ComponentProps<typeof CardContent>
    >();
    expectTypeOf<CardFooterProps>().toMatchTypeOf<
      ComponentProps<typeof CardFooter>
    >();

    expectTypeOf<TabsProps>().toMatchTypeOf<ComponentProps<typeof Tabs>>();
    expectTypeOf<TabsListProps>().toMatchTypeOf<
      ComponentProps<typeof TabsList>
    >();
    expectTypeOf<TabsTriggerProps>().toMatchTypeOf<
      ComponentProps<typeof TabsTrigger>
    >();
    expectTypeOf<TabsContentProps>().toMatchTypeOf<
      ComponentProps<typeof TabsContent>
    >();
    expectTypeOf<SegmentedControlProps>().toMatchTypeOf<
      ComponentProps<typeof SegmentedControl>
    >();
    expectTypeOf<SegmentedControlOption>().toMatchTypeOf<SegmentedControlOption>();

    expectTypeOf<DialogProps>().toMatchTypeOf<ComponentProps<typeof Dialog>>();
    expectTypeOf<DialogTriggerProps>().toMatchTypeOf<
      ComponentProps<typeof DialogTrigger>
    >();
    expectTypeOf<DialogContentProps>().toMatchTypeOf<
      ComponentProps<typeof DialogContent>
    >();
    expectTypeOf<DialogHeaderProps>().toMatchTypeOf<
      ComponentProps<typeof DialogHeader>
    >();
    expectTypeOf<DialogTitleProps>().toMatchTypeOf<
      ComponentProps<typeof DialogTitle>
    >();
    expectTypeOf<DialogDescriptionProps>().toMatchTypeOf<
      ComponentProps<typeof DialogDescription>
    >();
    expectTypeOf<DialogFooterProps>().toMatchTypeOf<
      ComponentProps<typeof DialogFooter>
    >();
    expectTypeOf<ConfirmDialogProps>().toMatchTypeOf<
      ComponentProps<typeof ConfirmDialog>
    >();
    expectTypeOf<UseConfirmDialogResult>().toMatchTypeOf<
      ReturnType<typeof useConfirmDialog>
    >();

    expectTypeOf<SheetProps>().toMatchTypeOf<ComponentProps<typeof Sheet>>();
    expectTypeOf<SheetTriggerProps>().toMatchTypeOf<
      ComponentProps<typeof SheetTrigger>
    >();
    expectTypeOf<SheetContentProps>().toMatchTypeOf<
      ComponentProps<typeof SheetContent>
    >();
    expectTypeOf<SheetHeaderProps>().toMatchTypeOf<
      ComponentProps<typeof SheetHeader>
    >();
    expectTypeOf<SheetTitleProps>().toMatchTypeOf<
      ComponentProps<typeof SheetTitle>
    >();
    expectTypeOf<SheetDescriptionProps>().toMatchTypeOf<
      ComponentProps<typeof SheetDescription>
    >();
    expectTypeOf<SheetFooterProps>().toMatchTypeOf<
      ComponentProps<typeof SheetFooter>
    >();
    expectTypeOf<ContextMenuProps>().toMatchTypeOf<
      ComponentProps<typeof ContextMenu>
    >();
    expectTypeOf<MenuProps>().toMatchTypeOf<ComponentProps<typeof Menu>>();
    expectTypeOf<MenuTriggerProps>().toMatchTypeOf<
      ComponentProps<typeof MenuTrigger>
    >();
    expectTypeOf<MenuContentProps>().toMatchTypeOf<
      ComponentProps<typeof MenuContent>
    >();
    expectTypeOf<MenuItemProps>().toMatchTypeOf<
      ComponentProps<typeof MenuItem>
    >();
    expectTypeOf<MenuLabelProps>().toMatchTypeOf<
      ComponentProps<typeof MenuLabel>
    >();
    expectTypeOf<MenuSeparatorProps>().toMatchTypeOf<
      ComponentProps<typeof MenuSeparator>
    >();
    expectTypeOf<MenuItemConfig>().toMatchTypeOf<MenuItemConfig>();

    expectTypeOf<FlexProps>().toMatchTypeOf<ComponentProps<typeof Flex>>();
    expectTypeOf<FlatListProps<string>>().toMatchTypeOf<
      Parameters<typeof FlatList>[0]
    >();
    expectTypeOf<PaginationProps>().toMatchTypeOf<
      ComponentProps<typeof Pagination>
    >();
    expectTypeOf<SideNavItemProps>().toMatchTypeOf<
      ComponentProps<typeof SideNavItem>
    >();
    expectTypeOf<TableProps>().toMatchTypeOf<ComponentProps<typeof Table>>();
    expectTypeOf<TableColumn>().toMatchTypeOf<TableColumn>();
    expectTypeOf<TableSortDirection>().toMatchTypeOf<TableSortDirection>();
    expectTypeOf<TableSortState>().toMatchTypeOf<TableSortState>();
    expectTypeOf<TableHeaderProps>().toMatchTypeOf<
      ComponentProps<typeof TableHeader>
    >();
    expectTypeOf<TableBodyProps>().toMatchTypeOf<
      ComponentProps<typeof TableBody>
    >();
    expectTypeOf<TableRowProps>().toMatchTypeOf<
      ComponentProps<typeof TableRow>
    >();
    expectTypeOf<TableCellProps>().toMatchTypeOf<
      ComponentProps<typeof TableCell>
    >();
    expectTypeOf<EmptyStateProps>().toMatchTypeOf<
      ComponentProps<typeof EmptyState>
    >();
    expectTypeOf<EmptyStateAction>().toMatchTypeOf<EmptyStateAction>();
    expectTypeOf<NoResultsProps>().toMatchTypeOf<
      ComponentProps<typeof NoResults>
    >();
    expectTypeOf<ToastProviderProps>().toMatchTypeOf<
      ComponentProps<typeof ToastProvider>
    >();
    expectTypeOf<ToastOptions>().toMatchTypeOf<ToastOptions>();
    expectTypeOf<ToastVariant>().toEqualTypeOf<
      'default' | 'success' | 'warning' | 'error'
    >();
    expectTypeOf<ToastAction>().toMatchTypeOf<ToastAction>();
    expectTypeOf<SkeletonProps>().toMatchTypeOf<
      ComponentProps<typeof Skeleton>
    >();
  });

  it('mirrors the external package entrypoint', () => {
    expectTypeOf<typeof ExternalApi.Button>().toEqualTypeOf<typeof Button>();
    expectTypeOf<ExternalApi.ButtonProps>().toEqualTypeOf<ButtonProps>();
    expectTypeOf<ExternalApi.InputProps>().toEqualTypeOf<InputProps>();
    expectTypeOf<ExternalApi.TextareaProps>().toEqualTypeOf<TextareaProps>();
    expectTypeOf<ExternalApi.NumberInput>().toEqualTypeOf<typeof NumberInput>();
    expectTypeOf<ExternalApi.NumberInputProps>().toEqualTypeOf<NumberInputProps>();
    expectTypeOf<ExternalApi.Combobox>().toEqualTypeOf<typeof Combobox>();
    expectTypeOf<ExternalApi.ComboboxProps>().toEqualTypeOf<ComboboxProps>();
    expectTypeOf<ExternalApi.ComboboxOption>().toEqualTypeOf<ComboboxOption>();
    expectTypeOf<ExternalApi.FileUpload>().toEqualTypeOf<typeof FileUpload>();
    expectTypeOf<ExternalApi.FileUploadProps>().toEqualTypeOf<FileUploadProps>();
    expectTypeOf<ExternalApi.UploadedFile>().toEqualTypeOf<UploadedFile>();
    expectTypeOf<ExternalApi.SelectProps>().toEqualTypeOf<SelectProps>();
    expectTypeOf<ExternalApi.CheckboxProps>().toEqualTypeOf<CheckboxProps>();
    expectTypeOf<ExternalApi.RadioProps>().toEqualTypeOf<RadioProps>();
    expectTypeOf<ExternalApi.DateRangeFilter>().toEqualTypeOf<
      typeof DateRangeFilter
    >();
    expectTypeOf<ExternalApi.DateRangeFilterProps>().toEqualTypeOf<DateRangeFilterProps>();
    expectTypeOf<ExternalApi.DateRangeValue>().toEqualTypeOf<DateRangeValue>();
    expectTypeOf<ExternalApi.DateRangePreset>().toEqualTypeOf<DateRangePreset>();
    expectTypeOf<ExternalApi.CardProps>().toEqualTypeOf<CardProps>();
    expectTypeOf<ExternalApi.CardHeaderProps>().toEqualTypeOf<CardHeaderProps>();
    expectTypeOf<ExternalApi.CardTitleProps>().toEqualTypeOf<CardTitleProps>();
    expectTypeOf<ExternalApi.CardDescriptionProps>().toEqualTypeOf<CardDescriptionProps>();
    expectTypeOf<ExternalApi.CardContentProps>().toEqualTypeOf<CardContentProps>();
    expectTypeOf<ExternalApi.CardFooterProps>().toEqualTypeOf<CardFooterProps>();
    expectTypeOf<ExternalApi.TabsProps>().toEqualTypeOf<TabsProps>();
    expectTypeOf<ExternalApi.TabsListProps>().toEqualTypeOf<TabsListProps>();
    expectTypeOf<ExternalApi.TabsTriggerProps>().toEqualTypeOf<TabsTriggerProps>();
    expectTypeOf<ExternalApi.TabsContentProps>().toEqualTypeOf<TabsContentProps>();
    expectTypeOf<ExternalApi.SegmentedControl>().toEqualTypeOf<
      typeof SegmentedControl
    >();
    expectTypeOf<ExternalApi.SegmentedControlProps>().toEqualTypeOf<SegmentedControlProps>();
    expectTypeOf<ExternalApi.SegmentedControlOption>().toEqualTypeOf<SegmentedControlOption>();
    expectTypeOf<ExternalApi.DialogProps>().toEqualTypeOf<DialogProps>();
    expectTypeOf<ExternalApi.DialogTriggerProps>().toEqualTypeOf<DialogTriggerProps>();
    expectTypeOf<ExternalApi.DialogContentProps>().toEqualTypeOf<DialogContentProps>();
    expectTypeOf<ExternalApi.DialogHeaderProps>().toEqualTypeOf<DialogHeaderProps>();
    expectTypeOf<ExternalApi.DialogTitleProps>().toEqualTypeOf<DialogTitleProps>();
    expectTypeOf<ExternalApi.DialogDescriptionProps>().toEqualTypeOf<DialogDescriptionProps>();
    expectTypeOf<ExternalApi.DialogFooterProps>().toEqualTypeOf<DialogFooterProps>();
    expectTypeOf<typeof ExternalApi.ConfirmDialog>().toEqualTypeOf<
      typeof ConfirmDialog
    >();
    expectTypeOf<ExternalApi.ConfirmDialogProps>().toEqualTypeOf<ConfirmDialogProps>();
    expectTypeOf<ExternalApi.useConfirmDialog>().toEqualTypeOf<
      typeof useConfirmDialog
    >();
    expectTypeOf<ExternalApi.UseConfirmDialogResult>().toEqualTypeOf<UseConfirmDialogResult>();
    expectTypeOf<ExternalApi.SheetProps>().toEqualTypeOf<SheetProps>();
    expectTypeOf<ExternalApi.SheetTriggerProps>().toEqualTypeOf<SheetTriggerProps>();
    expectTypeOf<ExternalApi.SheetContentProps>().toEqualTypeOf<SheetContentProps>();
    expectTypeOf<ExternalApi.SheetHeaderProps>().toEqualTypeOf<SheetHeaderProps>();
    expectTypeOf<ExternalApi.SheetTitleProps>().toEqualTypeOf<SheetTitleProps>();
    expectTypeOf<ExternalApi.SheetDescriptionProps>().toEqualTypeOf<SheetDescriptionProps>();
    expectTypeOf<ExternalApi.SheetFooterProps>().toEqualTypeOf<SheetFooterProps>();
    expectTypeOf<ExternalApi.ContextMenu>().toEqualTypeOf<typeof ContextMenu>();
    expectTypeOf<ExternalApi.ContextMenuProps>().toEqualTypeOf<ContextMenuProps>();
    expectTypeOf<ExternalApi.Menu>().toEqualTypeOf<typeof Menu>();
    expectTypeOf<ExternalApi.MenuProps>().toEqualTypeOf<MenuProps>();
    expectTypeOf<ExternalApi.MenuTrigger>().toEqualTypeOf<typeof MenuTrigger>();
    expectTypeOf<ExternalApi.MenuTriggerProps>().toEqualTypeOf<MenuTriggerProps>();
    expectTypeOf<ExternalApi.MenuContent>().toEqualTypeOf<typeof MenuContent>();
    expectTypeOf<ExternalApi.MenuContentProps>().toEqualTypeOf<MenuContentProps>();
    expectTypeOf<ExternalApi.MenuItem>().toEqualTypeOf<typeof MenuItem>();
    expectTypeOf<ExternalApi.MenuItemProps>().toEqualTypeOf<MenuItemProps>();
    expectTypeOf<ExternalApi.MenuLabel>().toEqualTypeOf<typeof MenuLabel>();
    expectTypeOf<ExternalApi.MenuLabelProps>().toEqualTypeOf<MenuLabelProps>();
    expectTypeOf<ExternalApi.MenuSeparator>().toEqualTypeOf<
      typeof MenuSeparator
    >();
    expectTypeOf<ExternalApi.MenuSeparatorProps>().toEqualTypeOf<MenuSeparatorProps>();
    expectTypeOf<ExternalApi.MenuItemConfig>().toEqualTypeOf<MenuItemConfig>();

    expectTypeOf<ExternalApi.Flex>().toEqualTypeOf<typeof Flex>();
    expectTypeOf<ExternalApi.FlexProps>().toEqualTypeOf<FlexProps>();
    expectTypeOf<ExternalApi.FlatList>().toEqualTypeOf<typeof FlatList>();
    expectTypeOf<ExternalApi.FlatListProps<string>>().toEqualTypeOf<
      FlatListProps<string>
    >();
    expectTypeOf<ExternalApi.Pagination>().toEqualTypeOf<typeof Pagination>();
    expectTypeOf<ExternalApi.PaginationProps>().toEqualTypeOf<PaginationProps>();
    expectTypeOf<ExternalApi.SideNavItem>().toEqualTypeOf<typeof SideNavItem>();
    expectTypeOf<ExternalApi.SideNavItemProps>().toEqualTypeOf<SideNavItemProps>();
    expectTypeOf<ExternalApi.Table>().toEqualTypeOf<typeof Table>();
    expectTypeOf<ExternalApi.TableProps>().toEqualTypeOf<TableProps>();
    expectTypeOf<ExternalApi.TableColumn>().toEqualTypeOf<TableColumn>();
    expectTypeOf<ExternalApi.TableSortDirection>().toEqualTypeOf<TableSortDirection>();
    expectTypeOf<ExternalApi.TableSortState>().toEqualTypeOf<TableSortState>();
    expectTypeOf<ExternalApi.TableHeader>().toEqualTypeOf<typeof TableHeader>();
    expectTypeOf<ExternalApi.TableHeaderProps>().toEqualTypeOf<TableHeaderProps>();
    expectTypeOf<ExternalApi.TableBody>().toEqualTypeOf<typeof TableBody>();
    expectTypeOf<ExternalApi.TableBodyProps>().toEqualTypeOf<TableBodyProps>();
    expectTypeOf<ExternalApi.TableRow>().toEqualTypeOf<typeof TableRow>();
    expectTypeOf<ExternalApi.TableRowProps>().toEqualTypeOf<TableRowProps>();
    expectTypeOf<ExternalApi.TableCell>().toEqualTypeOf<typeof TableCell>();
    expectTypeOf<ExternalApi.TableCellProps>().toEqualTypeOf<TableCellProps>();
    expectTypeOf<ExternalApi.EmptyState>().toEqualTypeOf<typeof EmptyState>();
    expectTypeOf<ExternalApi.EmptyStateProps>().toEqualTypeOf<EmptyStateProps>();
    expectTypeOf<ExternalApi.EmptyStateAction>().toEqualTypeOf<EmptyStateAction>();
    expectTypeOf<ExternalApi.NoResults>().toEqualTypeOf<typeof NoResults>();
    expectTypeOf<ExternalApi.NoResultsProps>().toEqualTypeOf<NoResultsProps>();
    expectTypeOf<ExternalApi.ToastProvider>().toEqualTypeOf<
      typeof ToastProvider
    >();
    expectTypeOf<ExternalApi.ToastProviderProps>().toEqualTypeOf<ToastProviderProps>();
    expectTypeOf<ExternalApi.ToastViewport>().toEqualTypeOf<
      typeof ToastViewport
    >();
    expectTypeOf<ExternalApi.ToastVariant>().toEqualTypeOf<ToastVariant>();
    expectTypeOf<ExternalApi.ToastAction>().toEqualTypeOf<ToastAction>();
    expectTypeOf<ExternalApi.ToastOptions>().toEqualTypeOf<ToastOptions>();
    expectTypeOf<ExternalApi.useToast>().toEqualTypeOf<typeof useToast>();
    expectTypeOf<ExternalApi.Skeleton>().toEqualTypeOf<typeof Skeleton>();
    expectTypeOf<ExternalApi.SkeletonProps>().toEqualTypeOf<SkeletonProps>();
  });
});
