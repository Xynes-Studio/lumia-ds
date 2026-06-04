'use client';

export * from './button/button';
export * from './badge/badge';
export * from './avatar/avatar';
export * from './tag/tag';
export * from './chip/chip';

// PFU-5: per-symbol re-exports for status-pill so linked-workspace consumers
// (xynes-auth-app, xynes-cms-console-web) resolve `StatusPill` and its props
// type cleanly under `tsc --noEmit` even when the package is consumed via
// `link:` rather than from a published tarball. The single-line `export *` form
// is preserved for every other surface; only the PFU-5-listed symbols
// (CardSubtitle, PageHeader, ConfirmDialog, useConfirmDialog, InlineAlert,
// StatusPill, AppTile, ViewMode) and their immediate prop-type companions are
// migrated to per-symbol form here.
export { StatusPill, statusPillStyles } from './status-pill/status-pill';
export type {
  StatusPillProps,
  StatusPillVariant,
} from './status-pill/status-pill';

export * from './input/input';
export * from './input-group/input-group';
export * from './number-input/number-input';
export * from './select/select';
export * from './combobox/combobox';
export * from './checkbox/checkbox';
export * from './radio/radio';

// PFU-5: per-symbol re-exports for card so `CardSubtitle` and its peers stay
// resolvable for linked-workspace consumers under `tsc --noEmit`.
export {
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './card/card';
export type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardSubtitleProps,
  CardDescriptionProps,
  CardContentProps,
  CardFooterProps,
} from './card/card';

export * from './stat-tile/stat-tile';

// PFU-5: per-symbol re-exports for entity-tile so `AppTile`, `EntityTile`,
// `UserTile` and the tile-context types stay resolvable for linked-workspace
// consumers. The existing `entity-tile/index.ts` barrel is preserved.
export { EntityTile, AppTile, UserTile } from './entity-tile/entity-tile';
export type {
  EntityTileProps,
  AppTileProps,
  UserTileProps,
  TileView,
  TileActionContext,
  TileSelectionContext,
  TileActivateContext,
  TileActionItem,
} from './entity-tile/entity-tile';

export * from './switch/switch';
export * from './tabs/tabs';
export * from './dialog/dialog';

// PFU-5: per-symbol re-exports for confirm-dialog so `ConfirmDialog` and
// `useConfirmDialog` stay resolvable for linked-workspace consumers under
// `tsc --noEmit`.
export {
  ConfirmDialog,
  useConfirmDialog,
} from './confirm-dialog/confirm-dialog';
export type {
  ConfirmDialogProps,
  UseConfirmDialogResult,
} from './confirm-dialog/confirm-dialog';

export * from './sheet/sheet';
export * from './drawer/drawer';
export * from './menu/menu';
export * from './context-menu/context-menu';
export * from './segmented-control/segmented-control';

// PFU-5: per-symbol re-exports for view-toggle so the `ViewMode` type alias
// stays resolvable for linked-workspace consumers under `tsc --noEmit`. The
// `ViewMode` type is consumed by `AppTile` callers in `xynes-auth-app`.
export { ViewToggle, viewToggleStyles } from './view-toggle/view-toggle';
export type { ViewMode, ViewToggleProps } from './view-toggle/view-toggle';

// PFU-5: per-symbol re-exports for alert so the `InlineAlert` named alias
// (`export const InlineAlert = Alert;`) stays resolvable for linked-workspace
// consumers under `tsc --noEmit`.
export { Alert, InlineAlert } from './alert/alert';
export type { AlertProps } from './alert/alert';

export * from './accordion/accordion';
export * from './flex/flex';
export * from './toolbar/toolbar';
export * from './flat-list/flat-list';
export * from './ticker/ticker';
export * from './table/table';
export * from './pagination/pagination';
export * from './date-range-filter/date-range-filter';
export * from './filter-bar/filter-bar';
export * from './breadcrumbs/breadcrumbs';

// PFU-5: per-symbol re-exports for page-header so `PageHeader` stays
// resolvable for linked-workspace consumers under `tsc --noEmit`.
export { PageHeader } from './page-header/page-header';
export type { PageHeaderProps } from './page-header/page-header';

export * from './empty-state/empty-state';
export * from './side-nav-item/side-nav-item';
export * from './directory-tree-nav/directory-tree-nav';
export * from './toast/toast';
export * from './progress-bar/progress-bar';
export * from './spinner/spinner';
export * from './skeleton/skeleton';
export * from './tooltip/tooltip';
export * from './popover/popover';
export * from './slider/slider';
export * from './date-picker/date-picker';
export * from './time-picker/time-picker';
export * from './file-upload/file-upload';
export * from './calendar';

// BUG-UNIVERSAL: shared cursor token for interactive primitives. Consumers
// composing link-styled <a> elements (or new in-app interactive surfaces) can
// import `interactiveCursor` / `interactiveCursorStateful` to inherit the same
// pointer / not-allowed contract Lumia DS components honour internally.
export {
  interactiveCursor,
  interactiveCursorStateful,
} from './lib/interactive-styles';

// LP-DS: brand mark for landing pages, marketing surfaces, and dashboard
// shells. The SVG bytes ship inline so the brand renders on first paint with
// no follow-up network round trip. Inlining the SVG outside this module is
// forbidden — use `<Brand variant="wordmark" | "icon" />` instead.
export { Brand, brandStyles } from './brand/brand';
export type {
  BrandProps,
  BrandVariant,
  BrandSize,
  BrandLabelledProps,
  BrandDecorativeProps,
} from './brand/brand';
