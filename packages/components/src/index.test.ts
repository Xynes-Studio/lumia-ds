import type { ComponentProps } from 'react';
import { describe, expect, expectTypeOf, it } from 'vitest';
import type * as ExternalApi from '@lumia/components';
import {
  Button,
  buttonStyles,
  type ButtonProps,
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
  Input,
  Textarea,
  type InputProps,
  type TextareaProps,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  type TabsContentProps,
  type TabsListProps,
  type TabsProps,
  type TabsTriggerProps,
  Flex,
  type FlexProps,
  FlatList,
  type FlatListProps,
  Pagination,
  type PaginationProps,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  type TableBodyProps,
  type TableCellProps,
  type TableHeaderProps,
  type TableProps,
  type TableRowProps,
} from './index';

describe('components index barrel', () => {
  it('exports all primitives and helpers', () => {
    expect(Button).toBeDefined();
    expect(buttonStyles.base).toBeDefined();
    expect(Input).toBeDefined();
    expect(Textarea).toBeDefined();
    expect(Select).toBeDefined();
    expect(Checkbox).toBeDefined();
    expect(Radio).toBeDefined();

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

    expect(Dialog).toBeDefined();
    expect(DialogTrigger).toBeDefined();
    expect(DialogContent).toBeDefined();
    expect(DialogHeader).toBeDefined();
    expect(DialogTitle).toBeDefined();
    expect(DialogDescription).toBeDefined();
    expect(DialogFooter).toBeDefined();

    expect(Sheet).toBeDefined();
    expect(SheetTrigger).toBeDefined();
    expect(SheetContent).toBeDefined();
    expect(SheetHeader).toBeDefined();
    expect(SheetTitle).toBeDefined();
    expect(SheetDescription).toBeDefined();
    expect(SheetFooter).toBeDefined();

    expect(Flex).toBeDefined();
    expect(FlatList).toBeDefined();
    expect(Pagination).toBeDefined();
    expect(Table).toBeDefined();
    expect(TableHeader).toBeDefined();
    expect(TableBody).toBeDefined();
    expect(TableRow).toBeDefined();
    expect(TableCell).toBeDefined();
  });

  it('provides consumer friendly prop types', () => {
    expectTypeOf<ButtonProps>().toMatchTypeOf<ComponentProps<typeof Button>>();
    expectTypeOf<InputProps>().toMatchTypeOf<ComponentProps<typeof Input>>();
    expectTypeOf<TextareaProps>().toMatchTypeOf<
      ComponentProps<typeof Textarea>
    >();
    expectTypeOf<SelectProps>().toMatchTypeOf<ComponentProps<typeof Select>>();
    expectTypeOf<CheckboxProps>().toMatchTypeOf<
      ComponentProps<typeof Checkbox>
    >();
    expectTypeOf<RadioProps>().toMatchTypeOf<ComponentProps<typeof Radio>>();

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

    expectTypeOf<FlexProps>().toMatchTypeOf<ComponentProps<typeof Flex>>();
    expectTypeOf<FlatListProps<string>>().toMatchTypeOf<
      Parameters<typeof FlatList>[0]
    >();
    expectTypeOf<PaginationProps>().toMatchTypeOf<
      ComponentProps<typeof Pagination>
    >();
    expectTypeOf<TableProps>().toMatchTypeOf<ComponentProps<typeof Table>>();
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
  });

  it('mirrors the external package entrypoint', () => {
    expectTypeOf<typeof ExternalApi.Button>().toEqualTypeOf<typeof Button>();
    expectTypeOf<ExternalApi.ButtonProps>().toEqualTypeOf<ButtonProps>();
    expectTypeOf<ExternalApi.InputProps>().toEqualTypeOf<InputProps>();
    expectTypeOf<ExternalApi.TextareaProps>().toEqualTypeOf<TextareaProps>();
    expectTypeOf<ExternalApi.SelectProps>().toEqualTypeOf<SelectProps>();
    expectTypeOf<ExternalApi.CheckboxProps>().toEqualTypeOf<CheckboxProps>();
    expectTypeOf<ExternalApi.RadioProps>().toEqualTypeOf<RadioProps>();
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
    expectTypeOf<ExternalApi.DialogProps>().toEqualTypeOf<DialogProps>();
    expectTypeOf<ExternalApi.DialogTriggerProps>().toEqualTypeOf<DialogTriggerProps>();
    expectTypeOf<ExternalApi.DialogContentProps>().toEqualTypeOf<DialogContentProps>();
    expectTypeOf<ExternalApi.DialogHeaderProps>().toEqualTypeOf<DialogHeaderProps>();
    expectTypeOf<ExternalApi.DialogTitleProps>().toEqualTypeOf<DialogTitleProps>();
    expectTypeOf<ExternalApi.DialogDescriptionProps>().toEqualTypeOf<DialogDescriptionProps>();
    expectTypeOf<ExternalApi.DialogFooterProps>().toEqualTypeOf<DialogFooterProps>();
    expectTypeOf<ExternalApi.SheetProps>().toEqualTypeOf<SheetProps>();
    expectTypeOf<ExternalApi.SheetTriggerProps>().toEqualTypeOf<SheetTriggerProps>();
    expectTypeOf<ExternalApi.SheetContentProps>().toEqualTypeOf<SheetContentProps>();
    expectTypeOf<ExternalApi.SheetHeaderProps>().toEqualTypeOf<SheetHeaderProps>();
    expectTypeOf<ExternalApi.SheetTitleProps>().toEqualTypeOf<SheetTitleProps>();
    expectTypeOf<ExternalApi.SheetDescriptionProps>().toEqualTypeOf<SheetDescriptionProps>();
    expectTypeOf<ExternalApi.SheetFooterProps>().toEqualTypeOf<SheetFooterProps>();

    expectTypeOf<ExternalApi.Flex>().toEqualTypeOf<typeof Flex>();
    expectTypeOf<ExternalApi.FlexProps>().toEqualTypeOf<FlexProps>();
    expectTypeOf<ExternalApi.FlatList>().toEqualTypeOf<typeof FlatList>();
    expectTypeOf<ExternalApi.FlatListProps<string>>().toEqualTypeOf<
      FlatListProps<string>
    >();
    expectTypeOf<ExternalApi.Pagination>().toEqualTypeOf<typeof Pagination>();
    expectTypeOf<ExternalApi.PaginationProps>().toEqualTypeOf<PaginationProps>();
    expectTypeOf<ExternalApi.Table>().toEqualTypeOf<typeof Table>();
    expectTypeOf<ExternalApi.TableProps>().toEqualTypeOf<TableProps>();
    expectTypeOf<ExternalApi.TableHeader>().toEqualTypeOf<typeof TableHeader>();
    expectTypeOf<ExternalApi.TableHeaderProps>().toEqualTypeOf<TableHeaderProps>();
    expectTypeOf<ExternalApi.TableBody>().toEqualTypeOf<typeof TableBody>();
    expectTypeOf<ExternalApi.TableBodyProps>().toEqualTypeOf<TableBodyProps>();
    expectTypeOf<ExternalApi.TableRow>().toEqualTypeOf<typeof TableRow>();
    expectTypeOf<ExternalApi.TableRowProps>().toEqualTypeOf<TableRowProps>();
    expectTypeOf<ExternalApi.TableCell>().toEqualTypeOf<typeof TableCell>();
    expectTypeOf<ExternalApi.TableCellProps>().toEqualTypeOf<TableCellProps>();
  });
});
