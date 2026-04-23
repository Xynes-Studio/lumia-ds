import type {
  CSSProperties,
  HTMLAttributes,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  Menu,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DirectoryTreeNav,
  SideNavItem,
  type DirectoryTreeNode,
} from '@lumia-ui/components';
import {
  getFallbackInitials,
  getNotificationTimeLabel,
  getUnreadNotificationIds,
  groupNotificationsByDate,
  isNavItemActive,
  isSafeNotificationHref,
} from './dashboard-shell.utils';

const cx = (...classes: Array<string | undefined | false | null>) =>
  classes.filter(Boolean).join(' ');

export type DashboardNavItem = {
  id: string;
  label: string;
  href: string;
  icon?: string;
  badgeCount?: number;
  exact?: boolean;
};

export type DashboardWorkspace = {
  id: string;
  name: string;
  slug?: string;
  roleLabel?: string;
  avatarSrc?: string;
};

export type DashboardDirectorySection = {
  navItemId: string;
  rootHref: string;
  rootLabel?: string;
  rootIcon?: string;
  activeHref?: string;
  nodes: DirectoryTreeNode[];
  expandedIds: string[];
  onExpandedIdsChange: (expandedIds: string[]) => void;
  onCreateDirectory: (input: { parentId: string | null; name: string }) => void;
  onRenameDirectory?: (input: { nodeId: string; name: string }) => void;
  onDeleteDirectory?: (input: { nodeId: string }) => void;
  canManageDirectories?: boolean;
  directoryActionDisabledReason?: string;
  maxNameLength?: number;
};

export type DashboardUserMenu = {
  name: string;
  email: string;
  avatarSrc?: string;
  avatarFallbackInitials?: string;
};

export type DashboardNotification = {
  id: string;
  title: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  fallbackInitials?: string;
  createdAt: string;
  unread?: boolean;
  deepLinkHref?: string;
  deepLinkTarget?: '_self' | '_blank';
  deepLinkRel?: string;
};

export type DashboardShellProps = {
  activePath: string;
  navItems: DashboardNavItem[];
  onNavigate?: (href: string, item: DashboardNavItem) => void;
  workspace: DashboardWorkspace | null;
  workspaceOptions: DashboardWorkspace[];
  onWorkspaceSelect: (workspaceId: string) => void;
  onCreateWorkspace?: () => void;
  enableWorkspaceCreation?: boolean;
  workspaceCreationDisabledMessage?: string;
  isSidebarCollapsed?: boolean;
  enableResponsiveCollapse?: boolean;
  responsiveCollapseBreakpointPx?: number;
  onResponsiveCollapseChange?: (collapsed: boolean) => void;
  sidebarExpandedWidth?: string;
  sidebarCollapsedWidth?: string;
  userMenu: DashboardUserMenu;
  onProfileOpen?: () => void;
  onLogout: () => void;
  notifications?: DashboardNotification[];
  isNotificationDrawerOpen?: boolean;
  defaultNotificationDrawerOpen?: boolean;
  onNotificationDrawerOpenChange?: (open: boolean) => void;
  onNotificationsViewed?: (notificationIds: string[]) => void;
  onNotificationClick?: (notification: DashboardNotification) => void;
  onNotificationDelete?: (notification: DashboardNotification) => void;
  onNotificationNavigate?: (notification: DashboardNotification) => void;
  enableNotificationAutoNavigate?: boolean;
  notificationDrawerDesktopWidth?: string;
  notificationDrawerMobileInset?: string;
  mobileNavigationEnabled?: boolean;
  mobileNavigationBreakpointPx?: number;
  mobileMenuOpen?: boolean;
  defaultMobileMenuOpen?: boolean;
  onMobileMenuOpenChange?: (open: boolean) => void;
  mobileNotificationsOpen?: boolean;
  defaultMobileNotificationsOpen?: boolean;
  onMobileNotificationsOpenChange?: (open: boolean) => void;
  mobileBottomBarInset?: string;
  mobileBottomSheetMaxHeight?: string;
  sidebarFooterNote?: string;
  directorySection?: DashboardDirectorySection;
  children: ReactNode;
};

export type DashboardSidebarSectionProps = HTMLAttributes<HTMLDivElement>;

export const DashboardSidebarSection = ({
  children,
  className,
  ...props
}: DashboardSidebarSectionProps) => (
  <div className={cx('flex flex-col gap-4', className)} {...props}>
    {children}
  </div>
);

export type DashboardMainSectionProps = HTMLAttributes<HTMLDivElement>;

export const DashboardMainSection = ({
  children,
  className,
  ...props
}: DashboardMainSectionProps) => (
  <section className={cx('h-full min-h-0 w-full', className)} {...props}>
    {children}
  </section>
);

const defaultFooterNote = 'Need access? Contact your workspace owner.';
const defaultWorkspaceCreationDisabledMessage =
  'Workspace creation is unavailable. Check settings or contact admin.';
const defaultSidebarExpandedWidth = '22rem';
const defaultSidebarCollapsedWidth = '5rem';
const defaultNotificationMobileInset = '0.75rem';
const defaultMobileNavigationBreakpoint = 1024;
const defaultMobileBottomBarInset = '0.75rem';
const defaultMobileBottomSheetMaxHeight = '100dvh';

export const DashboardShell = ({
  activePath,
  navItems,
  onNavigate,
  workspace,
  workspaceOptions,
  onWorkspaceSelect,
  onCreateWorkspace,
  enableWorkspaceCreation = true,
  workspaceCreationDisabledMessage = defaultWorkspaceCreationDisabledMessage,
  isSidebarCollapsed,
  onResponsiveCollapseChange,
  sidebarExpandedWidth = defaultSidebarExpandedWidth,
  sidebarCollapsedWidth = defaultSidebarCollapsedWidth,
  userMenu,
  onProfileOpen,
  onLogout,
  notifications = [],
  isNotificationDrawerOpen,
  defaultNotificationDrawerOpen = false,
  onNotificationDrawerOpenChange,
  onNotificationsViewed,
  onNotificationClick,
  onNotificationDelete,
  onNotificationNavigate,
  enableNotificationAutoNavigate = true,
  notificationDrawerDesktopWidth,
  notificationDrawerMobileInset = defaultNotificationMobileInset,
  mobileNavigationEnabled = true,
  mobileNavigationBreakpointPx = defaultMobileNavigationBreakpoint,
  mobileMenuOpen,
  defaultMobileMenuOpen = false,
  onMobileMenuOpenChange,
  mobileNotificationsOpen,
  defaultMobileNotificationsOpen = false,
  onMobileNotificationsOpenChange,
  mobileBottomBarInset = defaultMobileBottomBarInset,
  mobileBottomSheetMaxHeight = defaultMobileBottomSheetMaxHeight,
  sidebarFooterNote = defaultFooterNote,
  directorySection,
  children,
}: DashboardShellProps) => {
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [
    isNotificationDrawerOpenUncontrolled,
    setIsNotificationDrawerOpenUncontrolled,
  ] = useState(defaultNotificationDrawerOpen);
  const [isMobileMenuOpenUncontrolled, setIsMobileMenuOpenUncontrolled] =
    useState(defaultMobileMenuOpen);
  const [
    isMobileNotificationsOpenUncontrolled,
    setIsMobileNotificationsOpenUncontrolled,
  ] = useState(defaultMobileNotificationsOpen);

  const notificationTriggerRef = useRef<HTMLButtonElement | null>(null);

  const isSidebarCollapsedEffective = Boolean(isSidebarCollapsed);
  const isNotificationDrawerControlled =
    typeof isNotificationDrawerOpen === 'boolean';
  const isNotificationDrawerVisible = isNotificationDrawerControlled
    ? Boolean(isNotificationDrawerOpen)
    : isNotificationDrawerOpenUncontrolled;

  const isMobileMenuControlled = typeof mobileMenuOpen === 'boolean';
  const isMobileMenuVisible = isMobileMenuControlled
    ? Boolean(mobileMenuOpen)
    : isMobileMenuOpenUncontrolled;

  const isMobileNotificationsControlled =
    typeof mobileNotificationsOpen === 'boolean';
  const isMobileNotificationsVisible = isMobileNotificationsControlled
    ? Boolean(mobileNotificationsOpen)
    : isMobileNotificationsOpenUncontrolled;

  const unreadCount = notifications.filter((item) => item.unread).length;
  const activeSidebarWidth = isSidebarCollapsedEffective
    ? sidebarCollapsedWidth
    : sidebarExpandedWidth;
  const activeNotificationDrawerDesktopWidth =
    notificationDrawerDesktopWidth ?? activeSidebarWidth;

  const groupedNotifications = useMemo(
    () => groupNotificationsByDate(notifications),
    [notifications],
  );
  const mobileQuickNavItems = useMemo(
    () => navItems.slice(0, Math.min(2, navItems.length)),
    [navItems],
  );

  const otherWorkspaces = workspace
    ? workspaceOptions.filter((item) => item.id !== workspace.id)
    : workspaceOptions;

  const isMobileMode = mobileNavigationEnabled && isMobileViewport;

  const handleNotificationDrawerOpenChange = (nextOpen: boolean) => {
    if (!isNotificationDrawerControlled) {
      setIsNotificationDrawerOpenUncontrolled(nextOpen);
    }
    onNotificationDrawerOpenChange?.(nextOpen);
  };

  const handleMobileMenuOpenChange = (nextOpen: boolean) => {
    if (!isMobileMenuControlled) {
      setIsMobileMenuOpenUncontrolled(nextOpen);
    }
    onMobileMenuOpenChange?.(nextOpen);

    if (nextOpen) {
      if (!isMobileNotificationsControlled) {
        setIsMobileNotificationsOpenUncontrolled(false);
      }
      onMobileNotificationsOpenChange?.(false);
    }
  };

  const handleMobileNotificationsOpenChange = (nextOpen: boolean) => {
    if (!isMobileNotificationsControlled) {
      setIsMobileNotificationsOpenUncontrolled(nextOpen);
    }
    onMobileNotificationsOpenChange?.(nextOpen);

    if (nextOpen) {
      if (!isMobileMenuControlled) {
        setIsMobileMenuOpenUncontrolled(false);
      }
      onMobileMenuOpenChange?.(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const syncMobileViewport = () => {
      const nextIsMobile =
        window.innerWidth < Math.max(0, mobileNavigationBreakpointPx);
      setIsMobileViewport((previous) =>
        previous === nextIsMobile ? previous : nextIsMobile,
      );
    };

    syncMobileViewport();
    window.addEventListener('resize', syncMobileViewport);

    return () => {
      window.removeEventListener('resize', syncMobileViewport);
    };
  }, [mobileNavigationBreakpointPx]);

  const previousMobileModeRef = useRef<boolean | null>(null);
  useEffect(() => {
    const previous = previousMobileModeRef.current;

    if (previous === null) {
      previousMobileModeRef.current = isMobileMode;
      return;
    }

    if (previous === isMobileMode) {
      return;
    }

    if (isMobileMode) {
      handleNotificationDrawerOpenChange(false);
    } else {
      handleMobileMenuOpenChange(false);
      handleMobileNotificationsOpenChange(false);
    }

    previousMobileModeRef.current = isMobileMode;
  }, [isMobileMode]);

  const previousDesktopNotificationOpenRef = useRef(false);
  useEffect(() => {
    if (isMobileMode) {
      previousDesktopNotificationOpenRef.current = false;
      return;
    }

    const wasOpen = previousDesktopNotificationOpenRef.current;
    if (wasOpen && !isNotificationDrawerVisible) {
      const unreadNotificationIds = getUnreadNotificationIds(notifications);
      if (unreadNotificationIds.length > 0) {
        onNotificationsViewed?.(unreadNotificationIds);
      }
    }

    previousDesktopNotificationOpenRef.current = isNotificationDrawerVisible;
  }, [
    isMobileMode,
    isNotificationDrawerVisible,
    notifications,
    onNotificationsViewed,
  ]);

  const previousMobileNotificationOpenRef = useRef(false);
  useEffect(() => {
    if (!isMobileMode) {
      previousMobileNotificationOpenRef.current = false;
      return;
    }

    const wasOpen = previousMobileNotificationOpenRef.current;
    if (wasOpen && !isMobileNotificationsVisible) {
      const unreadNotificationIds = getUnreadNotificationIds(notifications);
      if (unreadNotificationIds.length > 0) {
        onNotificationsViewed?.(unreadNotificationIds);
      }
    }

    previousMobileNotificationOpenRef.current = isMobileNotificationsVisible;
  }, [
    isMobileMode,
    isMobileNotificationsVisible,
    notifications,
    onNotificationsViewed,
  ]);

  useEffect(() => {
    if (!isMobileMode && onResponsiveCollapseChange) {
      onResponsiveCollapseChange(Boolean(isSidebarCollapsed));
    }
  }, [isMobileMode, isSidebarCollapsed, onResponsiveCollapseChange]);

  const navigateToNotification = (notification: DashboardNotification) => {
    const href = notification.deepLinkHref;
    if (!href) {
      return;
    }

    onNotificationNavigate?.(notification);

    if (!enableNotificationAutoNavigate || !isSafeNotificationHref(href)) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    if (notification.deepLinkTarget === '_blank') {
      const relTokens = new Set(
        (notification.deepLinkRel ?? '')
          .split(/\s+/)
          .map((token) => token.trim())
          .filter(Boolean),
      );
      relTokens.add('noopener');
      relTokens.add('noreferrer');
      const featureValue = ['noopener', 'noreferrer']
        .filter((token) => relTokens.has(token))
        .join(',');
      window.open(href, '_blank', featureValue);
      return;
    }

    window.location.assign(href);
  };

  const navigateToNavItemHref = (href: string) => {
    if (!isSafeNotificationHref(href)) {
      return;
    }
    if (typeof window === 'undefined') {
      return;
    }
    window.location.assign(href);
  };

  const renderWorkspaceItem = (
    item: DashboardWorkspace,
    options?: { showCurrentBadge?: boolean },
  ) => (
    <div className="flex w-full items-center gap-3">
      <Avatar
        size="sm"
        alt={item.name}
        src={item.avatarSrc}
        fallbackInitials={getFallbackInitials(item.name)}
      />
      <div className="min-w-0 flex-1 text-left">
        <div className="truncate font-medium">{item.name}</div>
        {item.slug ? (
          <div className="truncate text-xs text-muted-foreground">
            {item.slug}
          </div>
        ) : null}
      </div>
      {options?.showCurrentBadge ? (
        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
          Current
        </span>
      ) : null}
    </div>
  );

  const renderWorkspaceSwitcher = (compact = false) => (
    <Menu open={isWorkspaceMenuOpen} onOpenChange={setIsWorkspaceMenuOpen}>
      <MenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cx(
            'w-full cursor-pointer rounded-md bg-background hover:bg-muted',
            compact
              ? 'h-auto flex-col items-center justify-center gap-1 px-2 py-2'
              : 'h-12 justify-between px-3',
          )}
          data-testid="dashboard-workspace-trigger"
        >
          <span className="flex min-w-0 items-center gap-3">
            <Avatar
              size="sm"
              src={workspace?.avatarSrc}
              alt={workspace?.name ?? 'Workspace'}
              fallbackInitials={getFallbackInitials(workspace?.name)}
            />
            {!compact ? (
              <span className="truncate text-base font-medium text-foreground">
                {workspace?.name ?? 'Workspace'}
              </span>
            ) : null}
          </span>
          <ChevronDownIcon
            className={cx(
              'h-5 w-5 shrink-0 text-foreground transition-transform duration-200',
              isWorkspaceMenuOpen && 'rotate-180',
            )}
          />
        </Button>
      </MenuTrigger>
      <MenuContent
        className="max-w-[calc(100vw-3rem)]"
        style={{ width: activeSidebarWidth }}
      >
        {workspace ? (
          <>
            <MenuLabel>Current Workspace</MenuLabel>
            <MenuItem
              disabled
              aria-current="true"
              data-testid="dashboard-workspace-current"
              className="cursor-default"
            >
              {renderWorkspaceItem(workspace, {
                showCurrentBadge: true,
              })}
            </MenuItem>
            <MenuSeparator />
          </>
        ) : null}

        {otherWorkspaces.length > 0 ? (
          <>
            <MenuLabel>Switch to</MenuLabel>
            {otherWorkspaces.map((item) => (
              <MenuItem
                key={item.id}
                label={item.name}
                data-workspace-id={item.id}
                onSelect={() => onWorkspaceSelect(item.id)}
              >
                {renderWorkspaceItem(item)}
              </MenuItem>
            ))}
          </>
        ) : null}

        <MenuSeparator />
        {enableWorkspaceCreation ? (
          <MenuItem
            label="Create new workspace"
            data-testid="dashboard-workspace-create"
            onSelect={onCreateWorkspace}
          >
            <div className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4 text-muted-foreground" />
              <span>Create new workspace</span>
            </div>
          </MenuItem>
        ) : (
          <>
            <MenuItem
              disabled
              data-testid="dashboard-workspace-create-disabled"
            >
              Workspace creation unavailable
            </MenuItem>
            <p className="px-3 py-2 text-xs text-muted-foreground">
              {workspaceCreationDisabledMessage}
            </p>
          </>
        )}
      </MenuContent>
    </Menu>
  );

  const renderProfileMenu = (compact = false) => (
    <Menu open={isProfileMenuOpen} onOpenChange={setIsProfileMenuOpen}>
      <MenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cx(
            'h-auto min-w-0 px-2 py-1 transition-all duration-300 ease-in-out',
            compact
              ? 'flex-col items-center justify-center gap-1'
              : 'justify-start gap-3',
          )}
          data-testid="dashboard-profile-trigger"
        >
          <Avatar
            size="sm"
            src={userMenu.avatarSrc}
            alt={userMenu.name}
            fallbackInitials={
              userMenu.avatarFallbackInitials ??
              getFallbackInitials(userMenu.name)
            }
          />
          {!compact ? (
            <span className="min-w-0 text-left">
              <span className="block truncate text-sm font-medium text-foreground">
                {userMenu.name}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {userMenu.email}
              </span>
            </span>
          ) : null}
          <ChevronDownIcon
            className={cx(
              'h-4 w-4 shrink-0 text-foreground transition-transform duration-200',
              isProfileMenuOpen && 'rotate-180',
            )}
          />
        </Button>
      </MenuTrigger>
      <MenuContent align="end">
        <MenuItem
          label="Profile"
          data-testid="dashboard-profile-item"
          onSelect={onProfileOpen}
        />
        <MenuSeparator />
        <MenuItem
          label="Logout"
          variant="destructive"
          data-testid="dashboard-logout-item"
          onSelect={onLogout}
        />
      </MenuContent>
    </Menu>
  );

  const renderNotificationList = () => (
    <div className="mt-2 flex min-h-0 flex-1 flex-col overflow-y-auto pr-1">
      {groupedNotifications.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notifications</p>
      ) : (
        <div className="space-y-5" aria-label="Notification list">
          {groupedNotifications.map((group) => (
            <section
              key={group.label}
              aria-label={group.label}
              data-testid={`dashboard-notification-group-${group.label}`}
              className="space-y-2"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </h3>
              <ul className="space-y-2">
                {group.items.map((item) => {
                  const notificationTimeLabel = getNotificationTimeLabel(
                    new Date(item.createdAt),
                  );

                  return (
                    <li
                      key={item.id}
                      className={cx(
                        'rounded-md border border-border/70 bg-background/80 p-2.5',
                        item.unread && 'border-primary/40 bg-primary/5',
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <button
                          type="button"
                          className="flex min-w-0 flex-1 items-start gap-3 text-left"
                          data-testid={`dashboard-notification-item-${item.id}`}
                          onClick={() => {
                            onNotificationClick?.(item);
                            navigateToNotification(item);
                          }}
                        >
                          <Avatar
                            size="sm"
                            src={item.imageSrc}
                            alt={item.imageAlt ?? item.title}
                            fallbackInitials={
                              item.fallbackInitials ??
                              getFallbackInitials(item.title)
                            }
                          />
                          <span className="min-w-0">
                            <span className="flex items-center gap-2">
                              {item.unread ? (
                                <span
                                  className="inline-flex h-2 w-2 shrink-0 rounded-full bg-primary"
                                  aria-hidden="true"
                                  data-testid={`dashboard-notification-unread-dot-${item.id}`}
                                />
                              ) : null}
                              <span className="block truncate text-sm font-medium text-foreground">
                                {item.title}
                              </span>
                            </span>
                            {item.description ? (
                              <span className="mt-0.5 block line-clamp-2 text-xs text-muted-foreground">
                                {item.description}
                              </span>
                            ) : null}
                            <span className="mt-1 block text-[11px] text-muted-foreground">
                              {notificationTimeLabel}
                            </span>
                          </span>
                        </button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 rounded-md"
                          aria-label={`Delete notification ${item.title}`}
                          data-testid={`dashboard-notification-delete-${item.id}`}
                          onClick={(
                            event: ReactMouseEvent<HTMLButtonElement>,
                          ) => {
                            event.stopPropagation();
                            onNotificationDelete?.(item);
                          }}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );

  const renderDesktopShell = () => (
    <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[1400px] flex-col gap-6 lg:h-[calc(100vh-3rem)] lg:flex-row">
      <aside
        className="w-full transition-all duration-300 ease-in-out lg:h-full lg:w-[var(--dashboard-sidebar-width)]"
        style={
          {
            '--dashboard-sidebar-width': activeSidebarWidth,
          } as CSSProperties
        }
        aria-label="Dashboard sidebar"
      >
        <Card
          data-testid="dashboard-sidebar-frame"
          className="h-full overflow-hidden border-border/60 bg-card/90 shadow-sm"
        >
          <div className="flex h-full flex-col">
            <CardHeader className="pb-5">
              {renderWorkspaceSwitcher(isSidebarCollapsedEffective)}
            </CardHeader>

            <CardContent className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden pt-0">
              <DashboardSidebarSection className="min-h-0 flex-1 overflow-hidden">
                <TooltipProvider>
                  <div
                    data-testid="dashboard-sidebar-scroll-region"
                    aria-label="Sidebar navigation scroll area"
                    tabIndex={0}
                    className="min-h-0 flex-1 overflow-y-auto pr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-inset"
                  >
                    <nav
                      aria-label="Dashboard navigation"
                      className={cx(
                        'mt-3 space-y-2 transition-all duration-300 ease-in-out',
                        isSidebarCollapsedEffective && 'space-y-1',
                      )}
                    >
                      {navItems.map((item) => {
                        const isDirectorySectionItem =
                          directorySection?.navItemId === item.id;

                        if (
                          isDirectorySectionItem &&
                          directorySection &&
                          !isSidebarCollapsedEffective
                        ) {
                          const safeRootHref = isSafeNotificationHref(
                            directorySection.rootHref,
                          )
                            ? directorySection.rootHref
                            : '#';

                          return (
                            <DirectoryTreeNav
                              key={item.id}
                              rootLabel={
                                directorySection.rootLabel ?? item.label
                              }
                              rootHref={safeRootHref}
                              rootIcon={directorySection.rootIcon ?? item.icon}
                              rootActive={isNavItemActive(
                                activePath,
                                item.href,
                                item.exact ?? false,
                              )}
                              activeHref={directorySection.activeHref}
                              nodes={directorySection.nodes}
                              expandedIds={directorySection.expandedIds}
                              onExpandedIdsChange={
                                directorySection.onExpandedIdsChange
                              }
                              onCreateDirectory={
                                directorySection.onCreateDirectory
                              }
                              onRenameDirectory={
                                directorySection.onRenameDirectory
                              }
                              onDeleteDirectory={
                                directorySection.onDeleteDirectory
                              }
                              canManageDirectories={
                                directorySection.canManageDirectories
                              }
                              directoryActionDisabledReason={
                                directorySection.directoryActionDisabledReason
                              }
                              maxNameLength={directorySection.maxNameLength}
                              onNavigate={(href: string) => {
                                if (onNavigate) {
                                  onNavigate(href, {
                                    ...item,
                                    href,
                                  });
                                  return;
                                }

                                navigateToNavItemHref(href);
                              }}
                            />
                          );
                        }

                        const safeItemHref = isSafeNotificationHref(item.href)
                          ? item.href
                          : '#';
                        const navItem = (
                          <SideNavItem
                            key={item.id}
                            label={item.label}
                            href={safeItemHref}
                            icon={item.icon}
                            badgeCount={
                              isSidebarCollapsedEffective
                                ? undefined
                                : item.badgeCount
                            }
                            active={isNavItemActive(
                              activePath,
                              item.href,
                              item.exact ?? false,
                            )}
                            aria-label={item.label}
                            className={cx(
                              'transition-all duration-300 ease-in-out',
                              isSidebarCollapsedEffective &&
                                'h-10 w-full justify-center px-2 [&>span.flex-1]:sr-only [&>span.ml-auto]:hidden',
                            )}
                            onClick={(event: Event) => {
                              if (!onNavigate) return;
                              event.preventDefault();
                              onNavigate(item.href, item);
                            }}
                          />
                        );

                        if (!isSidebarCollapsedEffective) {
                          return navItem;
                        }

                        return (
                          <Tooltip key={item.id}>
                            <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                            <TooltipContent side="right">
                              {item.label}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </nav>
                  </div>
                </TooltipProvider>
              </DashboardSidebarSection>

              <div className="mt-auto space-y-3 border-t border-border/70 pt-4">
                <div
                  className={cx(
                    'flex gap-3 transition-all duration-300 ease-in-out',
                    isSidebarCollapsedEffective
                      ? 'flex-col items-center'
                      : 'items-center justify-between',
                  )}
                >
                  {renderProfileMenu(isSidebarCollapsedEffective)}

                  <Button
                    ref={notificationTriggerRef}
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cx(
                      'relative rounded-md bg-transparent transition-all duration-300 ease-in-out hover:rounded-md hover:bg-muted',
                      isSidebarCollapsedEffective ? 'h-9 w-9' : 'h-10 w-10',
                    )}
                    aria-label="Open notifications"
                    data-testid="dashboard-notification-trigger"
                    onClick={(event: ReactMouseEvent<HTMLButtonElement>) => {
                      event.currentTarget.focus();
                      handleNotificationDrawerOpenChange(true);
                    }}
                  >
                    <BellIcon className="h-5 w-5 text-foreground" />
                    {unreadCount > 0 ? (
                      <span
                        className="absolute -right-1 -top-1 inline-flex h-[1.25rem] w-[1.25rem] items-center justify-center rounded-full bg-destructive text-[10px] font-semibold leading-none text-destructive-foreground"
                        aria-label={`${unreadCount} unread notifications`}
                        data-testid="dashboard-notification-badge"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    ) : null}
                  </Button>

                  <Drawer
                    open={isNotificationDrawerVisible}
                    onOpenChange={handleNotificationDrawerOpenChange}
                    side="left"
                    restoreFocusElement={notificationTriggerRef.current}
                    contentStyle={
                      {
                        '--dashboard-notification-desktop-width':
                          activeNotificationDrawerDesktopWidth,
                        '--dashboard-notification-mobile-inset':
                          notificationDrawerMobileInset,
                        borderRadius: '0px',
                      } as CSSProperties
                    }
                    contentClassName="left-[var(--dashboard-notification-mobile-inset)] top-[var(--dashboard-notification-mobile-inset)] h-[calc(100vh-(2*var(--dashboard-notification-mobile-inset)))] w-[calc(100vw-(2*var(--dashboard-notification-mobile-inset)))] max-w-none overflow-hidden rounded-none p-4 sm:p-5 md:left-0 md:top-0 md:h-full md:w-[var(--dashboard-notification-desktop-width)]"
                  >
                    <div
                      data-testid="dashboard-notification-drawer"
                      className="flex h-full min-h-0 flex-col"
                    >
                      <DrawerHeader>
                        <DrawerTitle data-testid="dashboard-notification-title">
                          Notifications ({unreadCount})
                        </DrawerTitle>
                      </DrawerHeader>

                      {renderNotificationList()}
                    </div>
                  </Drawer>
                </div>

                <p className="text-xs text-muted-foreground">
                  {sidebarFooterNote}
                </p>
              </div>
            </CardContent>
          </div>
        </Card>
      </aside>

      <main
        id="main-content"
        className="flex min-h-0 w-full flex-1"
        aria-label="Dashboard main content"
      >
        <Card
          data-testid="dashboard-main-frame"
          className="flex h-full min-h-0 w-full flex-col overflow-hidden border-border/70 bg-card/90 shadow-sm"
        >
          <CardContent
            data-testid="dashboard-main-scroll-frame"
            className="flex min-h-0 flex-1 flex-col p-6 lg:p-8"
          >
            <DashboardMainSection>{children}</DashboardMainSection>
          </CardContent>
        </Card>
      </main>
    </div>
  );

  const renderMobileShell = () => (
    <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[1400px] flex-col pb-24">
      <main
        id="main-content"
        className="flex min-h-0 w-full flex-1"
        aria-label="Dashboard main content"
      >
        <Card
          data-testid="dashboard-main-frame"
          className="flex h-full min-h-0 w-full flex-col overflow-hidden border-border/70 bg-card/90 shadow-sm"
        >
          <CardContent
            data-testid="dashboard-main-scroll-frame"
            className="flex min-h-0 flex-1 flex-col p-4 sm:p-6"
          >
            <DashboardMainSection>{children}</DashboardMainSection>
          </CardContent>
        </Card>
      </main>

      <div
        className="fixed bottom-0 left-0 right-0 z-30"
        style={{ padding: mobileBottomBarInset }}
        data-testid="dashboard-mobile-bottom-bar"
      >
        <div
          className="mx-auto grid w-full max-w-md items-stretch gap-1 rounded-2xl border border-border/70 bg-background/95 p-1.5 shadow-lg backdrop-blur-sm"
          style={{
            gridTemplateColumns: `repeat(${mobileQuickNavItems.length + 2}, minmax(0, 1fr))`,
          }}
        >
          <Button
            type="button"
            variant="ghost"
            className={cx(
              'relative h-auto min-h-[4.25rem] flex-col justify-center gap-1 rounded-xl px-2 py-2 text-muted-foreground hover:bg-muted/70 hover:text-foreground',
              isMobileNotificationsVisible && 'bg-primary/12 text-primary-900',
            )}
            aria-label="Open notifications"
            data-testid="dashboard-mobile-notifications-tab"
            onClick={() => handleMobileNotificationsOpenChange(true)}
          >
            <BellIcon className="h-5 w-5" />
            <span className="text-xs font-medium">Notifications</span>
            {unreadCount > 0 ? (
              <span
                className="absolute right-2 top-1 inline-flex h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground"
                data-testid="dashboard-mobile-notification-badge"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : null}
          </Button>

          {mobileQuickNavItems.map((item) => (
            <Button
              key={item.id}
              type="button"
              variant="ghost"
              className={cx(
                'h-auto min-h-[4.25rem] flex-col justify-center gap-1 rounded-xl px-2 py-2 text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                isNavItemActive(activePath, item.href, item.exact ?? false) &&
                  'bg-primary/12 text-primary-900',
              )}
              aria-label={item.label}
              data-testid={`dashboard-mobile-nav-tab-${item.id}`}
              onClick={() => {
                if (onNavigate) {
                  onNavigate(item.href, item);
                  return;
                }
                navigateToNavItemHref(item.href);
              }}
            >
              {renderMobileQuickNavIcon(item.icon)}
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          ))}

          <Button
            type="button"
            variant="ghost"
            className={cx(
              'h-auto min-h-[4.25rem] flex-col justify-center gap-1 rounded-xl px-2 py-2 text-muted-foreground hover:bg-muted/70 hover:text-foreground',
              isMobileMenuVisible && 'bg-primary/12 text-primary-900',
            )}
            aria-label="Open menu"
            data-testid="dashboard-mobile-menu-tab"
            onClick={() => handleMobileMenuOpenChange(true)}
          >
            <MenuIcon className="h-5 w-5" />
            <span className="text-xs font-medium">Menu</span>
          </Button>
        </div>
      </div>

      <Drawer
        open={isMobileNotificationsVisible}
        onOpenChange={handleMobileNotificationsOpenChange}
        side="bottom"
        contentClassName="left-0 right-0 top-auto h-full max-w-none rounded-none border-x-0 border-b-0 p-4"
        contentStyle={{
          height: mobileBottomSheetMaxHeight,
          maxHeight: mobileBottomSheetMaxHeight,
        }}
      >
        <div
          data-testid="dashboard-mobile-notifications-sheet"
          data-state={isMobileNotificationsVisible ? 'open' : 'closed'}
          className="flex h-full min-h-0 flex-col"
        >
          <DrawerHeader>
            <DrawerTitle data-testid="dashboard-mobile-notification-title">
              Notifications ({unreadCount})
            </DrawerTitle>
          </DrawerHeader>
          {renderNotificationList()}
        </div>
      </Drawer>

      <Drawer
        open={isMobileMenuVisible}
        onOpenChange={handleMobileMenuOpenChange}
        side="bottom"
        contentClassName="left-0 right-0 top-auto h-full max-w-none rounded-none border-x-0 border-b-0 p-4 pt-14"
        contentStyle={{
          height: mobileBottomSheetMaxHeight,
          maxHeight: mobileBottomSheetMaxHeight,
        }}
      >
        <div
          data-testid="dashboard-mobile-menu-sheet"
          data-state={isMobileMenuVisible ? 'open' : 'closed'}
          className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto"
        >
          <div>{renderWorkspaceSwitcher(false)}</div>

          <nav aria-label="Mobile dashboard navigation" className="space-y-2">
            {navItems.map((item) => {
              const isDirectorySectionItem =
                directorySection?.navItemId === item.id;

              if (isDirectorySectionItem && directorySection) {
                const safeRootHref = isSafeNotificationHref(
                  directorySection.rootHref,
                )
                  ? directorySection.rootHref
                  : '#';

                return (
                  <DirectoryTreeNav
                    key={item.id}
                    rootLabel={directorySection.rootLabel ?? item.label}
                    rootHref={safeRootHref}
                    rootIcon={directorySection.rootIcon ?? item.icon}
                    rootActive={isNavItemActive(
                      activePath,
                      item.href,
                      item.exact ?? false,
                    )}
                    activeHref={directorySection.activeHref}
                    nodes={directorySection.nodes}
                    expandedIds={directorySection.expandedIds}
                    onExpandedIdsChange={directorySection.onExpandedIdsChange}
                    onCreateDirectory={directorySection.onCreateDirectory}
                    onRenameDirectory={directorySection.onRenameDirectory}
                    onDeleteDirectory={directorySection.onDeleteDirectory}
                    canManageDirectories={directorySection.canManageDirectories}
                    directoryActionDisabledReason={
                      directorySection.directoryActionDisabledReason
                    }
                    maxNameLength={directorySection.maxNameLength}
                    onNavigate={(href: string) => {
                      if (onNavigate) {
                        onNavigate(href, {
                          ...item,
                          href,
                        });
                        return;
                      }
                      navigateToNavItemHref(href);
                    }}
                  />
                );
              }

              // Prevent unsafe scheme navigation from host-provided nav config.
              // Callbacks still receive original href for host-side handling/validation.
              const safeItemHref = isSafeNotificationHref(item.href)
                ? item.href
                : '#';
              return (
                <SideNavItem
                  key={item.id}
                  label={item.label}
                  href={safeItemHref}
                  icon={item.icon}
                  badgeCount={item.badgeCount}
                  active={isNavItemActive(
                    activePath,
                    item.href,
                    item.exact ?? false,
                  )}
                  aria-label={item.label}
                  onClick={(event: Event) => {
                    if (!onNavigate) return;
                    event.preventDefault();
                    onNavigate(item.href, item);
                  }}
                />
              );
            })}
          </nav>

          <div className="mt-auto space-y-3 border-t border-border/70 pt-4">
            {renderProfileMenu(false)}
            <p className="text-xs text-muted-foreground">{sidebarFooterNote}</p>
          </div>
        </div>
      </Drawer>
    </div>
  );

  return (
    <div className="relative min-h-screen w-full bg-background px-4 py-4 sm:px-6 sm:py-6">
      {isMobileMode ? renderMobileShell() : renderDesktopShell()}
    </div>
  );
};

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
      <path d="M9 17a3 3 0 0 0 6 0" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M3 12h18" />
      <path d="M3 18h18" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function renderMobileQuickNavIcon(icon?: string) {
  switch (icon) {
    case 'package':
    case 'layout-grid':
      return <AppsIcon className="h-5 w-5" />;
    case 'users':
    case 'users-round':
    case 'user':
      return <UsersIcon className="h-5 w-5" />;
    case 'folder-key':
      return <FolderKeyIcon className="h-5 w-5" />;
    case 'lock':
      return <LockIcon className="h-5 w-5" />;
    case 'file-text':
      return <FileTextIcon className="h-5 w-5" />;
    case 'dollar-sign':
      return <DollarSignIcon className="h-5 w-5" />;
    case 'reports':
      return <ReportsIcon className="h-5 w-5" />;
    case 'link':
      return <LinkIcon className="h-5 w-5" />;
    case 'settings':
      return <SettingsIcon className="h-5 w-5" />;
    default:
      return <SquareIcon className="h-5 w-5" />;
  }
}

function AppsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function FolderKeyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7l-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16Z" />
      <circle cx="15" cy="13" r="2" />
      <path d="M17 13h2l1 1v1h-1l-1 1" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l2.5-2.5a5 5 0 0 0-7.07-7.07l-1.04 1.04" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-2.5 2.5a5 5 0 0 0 7.07 7.07l1.04-1.04" />
    </svg>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  );
}

function DollarSignIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H7" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c0 .7.4 1.3 1.1 1.5H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.4 1z" />
    </svg>
  );
}

function ReportsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 3v18h18" />
      <path d="M7 14v4" />
      <path d="M12 10v8" />
      <path d="M17 6v12" />
    </svg>
  );
}

function SquareIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="5" width="14" height="14" rx="2" />
    </svg>
  );
}
