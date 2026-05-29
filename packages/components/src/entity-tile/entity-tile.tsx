import type {
  CSSProperties,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  Ref,
  ReactNode,
} from 'react';
import { forwardRef, useEffect, useRef } from 'react';
import { Icon, type IconId } from '@lumia-ui/icons';
import { Checkbox } from '../checkbox/checkbox';
import { Flex } from '../flex/flex';
import { cn } from '../lib/utils';
import { Spinner } from '../spinner/spinner';
import { interactiveCursor } from '../lib/interactive-styles';

export type TileView = 'grid' | 'list';

export type TileActionContext<TItem> = {
  actionId: string;
  item: TItem | undefined;
  tileId: string;
  view: TileView;
  selected: boolean;
};

export type TileSelectionContext<TItem> = {
  item: TItem | undefined;
  tileId: string;
  view: TileView;
};

export type TileActivateContext<TItem> = {
  item: TItem | undefined;
  tileId: string;
  view: TileView;
};

export type TileActionItem<TItem> = {
  id: string;
  label: string;
  icon?: IconId | ReactNode;
  disabled?: boolean;
  destructive?: boolean;
  isLoading?: boolean;
  onSelect: (ctx: TileActionContext<TItem>) => void;
};

export type EntityTileProps<TItem = unknown> = HTMLAttributes<HTMLElement> & {
  tileId: string;
  item?: TItem;
  view: TileView;
  title: string;
  subtitle?: string;
  avatarSrc?: string;
  avatarAlt?: string;
  avatarFallbackInitials?: string;
  meta?: ReactNode;
  selectable?: boolean;
  selected?: boolean;
  onSelectedChange?: (next: boolean, ctx: TileSelectionContext<TItem>) => void;
  selectionAriaLabel?: string;
  actions?: TileActionItem<TItem>[];
  onActivate?: (ctx: TileActivateContext<TItem>) => void;
  href?: string;
  actionVisibility?: 'auto' | 'hover' | 'always';
  hoverAccentColor?: string;
};

export type AppTileProps<TItem = unknown> = EntityTileProps<TItem>;

export type UserTileProps<TItem = unknown> = Omit<
  EntityTileProps<TItem>,
  'title' | 'subtitle' | 'meta'
> & {
  name: string;
  designation?: string;
  teamName?: string;
  meta?: ReactNode;
};

type ActionButtonProps<TItem> = {
  action: TileActionItem<TItem>;
  item: TItem | undefined;
  tileId: string;
  view: TileView;
  selected: boolean;
  shadowClass?: string;
};

const ActionButton = <TItem,>({
  action,
  item,
  tileId,
  view,
  selected,
  shadowClass,
}: ActionButtonProps<TItem>) => {
  return (
    <button
      type="button"
      aria-label={action.label}
      disabled={action.disabled || action.isLoading}
      data-lumia-tile-action-id={action.id}
      className={cn(
        `inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/90 p-0 transition-[box-shadow,background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ring-offset-background ${interactiveCursor} disabled:opacity-50`,
        shadowClass,
        action.destructive
          ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
          : 'bg-background text-foreground hover:bg-muted',
      )}
      onClick={(event) => {
        event.stopPropagation();
        action.onSelect({
          actionId: action.id,
          item,
          tileId,
          view,
          selected,
        });
      }}
    >
      {action.isLoading ? (
        <Spinner size={14} aria-label="Loading" />
      ) : typeof action.icon === 'string' ? (
        <Icon
          name={action.icon}
          size={16}
          aria-hidden="true"
          className="shrink-0"
        />
      ) : action.icon ? (
        action.icon
      ) : (
        <Icon name="info" size={16} aria-hidden="true" className="shrink-0" />
      )}
      <span className="sr-only">{action.label}</span>
    </button>
  );
};

const getInitials = (value?: string) => {
  const cleaned = value?.trim();
  if (!cleaned) return undefined;

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
  }

  return cleaned.slice(0, 2).toUpperCase();
};

export const EntityTile = forwardRef<HTMLElement, EntityTileProps>(
  function EntityTile(
    {
      tileId,
      item,
      view,
      title,
      subtitle,
      avatarSrc,
      avatarAlt,
      avatarFallbackInitials,
      meta,
      selectable = false,
      selected = false,
      onSelectedChange,
      selectionAriaLabel,
      actions,
      onActivate,
      href,
      actionVisibility = 'auto',
      hoverAccentColor,
      className,
      onClick,
      onKeyDown,
      style,
      ...props
    },
    ref,
  ) {
    const maxActions = 3;
    const hasTooManyActions = (actions?.length ?? 0) > maxActions;
    const previousHasTooManyActionsRef = useRef(false);

    useEffect(() => {
      if (hasTooManyActions && !previousHasTooManyActionsRef.current) {
        console.warn(
          '[EntityTile] Maximum 3 quick actions are supported; extra actions were ignored.',
        );
      }

      previousHasTooManyActionsRef.current = hasTooManyActions;
    }, [hasTooManyActions]);

    const actionItems = (actions ?? []).slice(0, maxActions);
    const hasActions = actionItems.length > 0;
    const isInteractive = Boolean(onActivate || href);

    const isAlwaysVisible =
      actionVisibility === 'always' ||
      (actionVisibility === 'auto' && view === 'list');
    const isHoverReveal =
      actionVisibility === 'hover' ||
      (actionVisibility === 'auto' && view === 'grid');

    const triggerActivate = () => {
      if (!isInteractive) return;
      onActivate?.({ item, tileId, view });
    };

    const handleTileClick = (event: MouseEvent<HTMLElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      triggerActivate();
    };

    const handleTileKeyDown = (event: KeyboardEvent<HTMLElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (
        event.key !== 'Enter' &&
        event.key !== ' ' &&
        event.key !== 'Spacebar'
      ) {
        return;
      }

      const isAnchorTarget = event.currentTarget.tagName === 'A';
      if (isAnchorTarget) {
        return;
      }

      event.preventDefault();
      triggerActivate();
    };

    const handleSelectionChange = (next: boolean) => {
      onSelectedChange?.(next, { item, tileId, view });
    };

    const tileStyle = {
      ...style,
      '--entity-tile-accent': hoverAccentColor ?? 'rgb(246 196 128 / 0.24)',
    } as CSSProperties;

    const avatarSizeClasses = view === 'list' ? 'h-10 w-10' : 'h-16 w-16';
    const fallbackText = getInitials(avatarFallbackInitials ?? title) ?? '?';
    const rootClassName = cn(
      'group relative overflow-visible rounded-[10px] border border-border bg-background text-foreground shadow-sm transition-[box-shadow,border-color,background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ring-offset-background',
      isInteractive &&
        'cursor-pointer hover:border-border hover:shadow-lg focus-within:border-border focus-within:shadow-lg',
      view === 'list' ? 'flex items-center' : 'block',
      view === 'list' ? 'h-[76px] w-full px-4 py-3' : 'w-[170px] py-7',
      className,
    );
    const tileBody = (
      <>
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 rounded-[10px] opacity-0 transition-opacity duration-200',
            'bg-[linear-gradient(110deg,var(--entity-tile-accent)_0%,transparent_55%)]',
            'group-hover:opacity-100 group-focus-within:opacity-100',
          )}
        />

        {selectable ? (
          <span
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
            className={cn(
              'z-10',
              view === 'list' ? 'mr-2 shrink-0' : 'absolute left-3 top-3',
            )}
          >
            <Checkbox
              checked={selected}
              onChange={(event) => handleSelectionChange(event.target.checked)}
              aria-label={selectionAriaLabel ?? `Select ${title}`}
            />
          </span>
        ) : null}

        <Flex
          direction={view === 'list' ? 'row' : 'col'}
          align="center"
          justify={view === 'list' ? 'between' : 'center'}
          className={cn(
            'min-w-0',
            view === 'list' ? 'flex-1 gap-3' : 'w-full gap-3 px-3',
          )}
        >
          <Flex
            direction={view === 'list' ? 'row' : 'col'}
            align="center"
            justify="center"
            className={cn('min-w-0', view === 'list' ? 'gap-3' : 'gap-2')}
          >
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={avatarAlt ?? title}
                className={cn('rounded-full object-cover', avatarSizeClasses)}
              />
            ) : (
              <span
                aria-label={avatarAlt ?? title}
                className={cn(
                  'inline-flex items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground',
                  avatarSizeClasses,
                )}
              >
                {fallbackText}
              </span>
            )}

            <Flex
              direction="col"
              className={cn(
                'min-w-0',
                view === 'list' ? 'text-left' : 'max-w-[132px] text-center',
              )}
            >
              <p className="truncate text-base font-medium leading-5 text-foreground">
                {title}
              </p>
              {subtitle ? (
                <p className="truncate text-xs font-medium leading-4 text-muted-foreground">
                  {subtitle}
                </p>
              ) : null}
            </Flex>
          </Flex>

          {view === 'list' ? (
            <Flex align="center" className="ml-3 shrink-0 gap-2">
              {meta ? <div className="shrink-0">{meta}</div> : null}
              <Flex
                align="center"
                justify="end"
                data-lumia-entity-tile-actions
                data-visible={isAlwaysVisible ? 'true' : 'false'}
                className={cn(
                  'min-w-[112px] gap-1.5 transition-opacity duration-200',
                  isAlwaysVisible && 'opacity-100',
                  !isAlwaysVisible &&
                    isHoverReveal &&
                    'pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100',
                )}
              >
                {hasActions
                  ? actionItems.map((action) => (
                      <ActionButton
                        key={action.id}
                        action={action}
                        item={item}
                        tileId={tileId}
                        view={view}
                        selected={selected}
                        shadowClass="shadow-sm"
                      />
                    ))
                  : null}
              </Flex>
            </Flex>
          ) : (
            <>
              {meta ? <div className="mt-2">{meta}</div> : null}
              <Flex
                align="center"
                justify="center"
                data-lumia-entity-tile-actions
                data-visible={isAlwaysVisible ? 'true' : 'false'}
                className={cn(
                  'absolute left-1/2 -top-4 z-20 min-h-8 min-w-[112px] -translate-x-1/2 gap-1.5 transition-all duration-200',
                  isAlwaysVisible && 'opacity-100',
                  !isAlwaysVisible &&
                    isHoverReveal &&
                    'pointer-events-none translate-y-2 opacity-0 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100',
                )}
              >
                {hasActions
                  ? actionItems.map((action) => (
                      <ActionButton
                        key={action.id}
                        action={action}
                        item={item}
                        tileId={tileId}
                        view={view}
                        selected={selected}
                        shadowClass="shadow-md"
                      />
                    ))
                  : null}
              </Flex>
            </>
          )}
        </Flex>
      </>
    );

    if (href) {
      return (
        <a
          ref={ref as Ref<HTMLAnchorElement>}
          href={href}
          data-lumia-entity-tile
          data-view={view}
          onClick={handleTileClick}
          onKeyDown={handleTileKeyDown}
          style={tileStyle}
          className={rootClassName}
          {...props}
        >
          {tileBody}
        </a>
      );
    }

    return (
      <div
        ref={ref as Ref<HTMLDivElement>}
        data-lumia-entity-tile
        data-view={view}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : -1}
        onClick={handleTileClick}
        onKeyDown={handleTileKeyDown}
        style={tileStyle}
        className={rootClassName}
        {...props}
      >
        {tileBody}
      </div>
    );
  },
);

export const AppTile = forwardRef<HTMLElement, AppTileProps>(
  function AppTile(props, ref) {
    return <EntityTile ref={ref} {...props} />;
  },
);

export const UserTile = forwardRef<HTMLElement, UserTileProps>(
  function UserTile({ name, designation, teamName, meta, ...props }, ref) {
    const resolvedMeta =
      meta ??
      (teamName ? (
        <span className="inline-flex items-center rounded-full border border-border px-2 py-1 text-xs font-medium leading-[14px] text-foreground">
          {teamName}
        </span>
      ) : undefined);

    return (
      <EntityTile
        ref={ref}
        title={name}
        subtitle={designation}
        meta={resolvedMeta}
        {...props}
      />
    );
  },
);
