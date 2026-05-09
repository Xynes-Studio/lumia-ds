import { useRef, useState } from 'react';
import {
  Avatar,
  Button,
  Menu,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuTrigger,
} from '@lumia-ui/components';
import { getFallbackInitials } from './dashboard-shell.utils';

const cx = (...classes: Array<string | undefined | false | null>) =>
  classes.filter(Boolean).join(' ');

export type DashboardWorkspaceSwitcherWorkspace = {
  id: string;
  name: string;
  slug?: string;
  roleLabel?: string;
  avatarSrc?: string;
};

export type DashboardWorkspaceSwitcherLabels = {
  trigger: string;
  fallbackName: string;
  currentSection: string;
  currentBadge: string;
  switchToSection: string;
  createAction: string;
  createUnavailableAction: string;
};

export type DashboardWorkspaceSwitcherProps = {
  workspace: DashboardWorkspaceSwitcherWorkspace | null;
  workspaceOptions: DashboardWorkspaceSwitcherWorkspace[];
  onWorkspaceSelect: (workspaceId: string) => void;
  onCreateWorkspace?: () => void;
  labels?: Partial<DashboardWorkspaceSwitcherLabels>;
  enableWorkspaceCreation?: boolean;
  workspaceCreationDisabledMessage?: string;
  compact?: boolean;
  width?: string;
  className?: string;
  menuContentClassName?: string;
};

const defaultLabels: DashboardWorkspaceSwitcherLabels = {
  trigger: 'Switch workspace',
  fallbackName: 'Workspace',
  currentSection: 'Current Workspace',
  currentBadge: 'Current',
  switchToSection: 'Switch to',
  createAction: 'Create new workspace',
  createUnavailableAction: 'Workspace creation unavailable',
};

const defaultWorkspaceCreationDisabledMessage =
  'Workspace creation is unavailable. Check settings or contact admin.';

const renderWorkspaceItem = (
  item: DashboardWorkspaceSwitcherWorkspace,
  labels: DashboardWorkspaceSwitcherLabels,
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
        {labels.currentBadge}
      </span>
    ) : null}
  </div>
);

export function DashboardWorkspaceSwitcher({
  workspace,
  workspaceOptions,
  onWorkspaceSelect,
  onCreateWorkspace,
  labels,
  enableWorkspaceCreation = true,
  workspaceCreationDisabledMessage = defaultWorkspaceCreationDisabledMessage,
  compact = false,
  width,
  className,
  menuContentClassName,
}: DashboardWorkspaceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const resolvedLabels: DashboardWorkspaceSwitcherLabels = {
    ...defaultLabels,
    ...labels,
  };
  const otherWorkspaces = workspace
    ? workspaceOptions.filter((item) => item.id !== workspace.id)
    : workspaceOptions;

  return (
    <Menu open={isOpen} onOpenChange={setIsOpen}>
      <MenuTrigger ref={triggerRef} asChild>
        <Button
          type="button"
          variant="ghost"
          className={cx(
            'w-full cursor-pointer rounded-md bg-background hover:bg-muted',
            compact
              ? 'h-auto flex-col items-center justify-center gap-1 px-2 py-2'
              : 'h-12 justify-between px-3',
            className,
          )}
          aria-label={resolvedLabels.trigger}
          data-testid="dashboard-workspace-trigger"
        >
          <span className="flex min-w-0 items-center gap-3">
            <Avatar
              size="sm"
              src={workspace?.avatarSrc}
              alt={workspace?.name ?? resolvedLabels.fallbackName}
              fallbackInitials={getFallbackInitials(workspace?.name)}
            />
            {!compact ? (
              <span className="truncate text-base font-medium text-foreground">
                {workspace?.name ?? resolvedLabels.fallbackName}
              </span>
            ) : null}
          </span>
          <ChevronDownIcon
            className={cx(
              'h-5 w-5 shrink-0 text-foreground transition-transform duration-200',
              isOpen && 'rotate-180',
            )}
          />
        </Button>
      </MenuTrigger>
      <MenuContent
        className={cx('max-w-[calc(100vw-3rem)]', menuContentClassName)}
        onCloseAutoFocus={(event: Event) => {
          event.preventDefault();
          triggerRef.current?.focus();
        }}
        style={width ? { width } : undefined}
      >
        {workspace ? (
          <>
            <MenuLabel>{resolvedLabels.currentSection}</MenuLabel>
            <MenuItem
              disabled
              aria-current="true"
              data-testid="dashboard-workspace-current"
              className="cursor-default"
            >
              {renderWorkspaceItem(workspace, resolvedLabels, {
                showCurrentBadge: true,
              })}
            </MenuItem>
            <MenuSeparator />
          </>
        ) : null}

        {otherWorkspaces.length > 0 ? (
          <>
            <MenuLabel>{resolvedLabels.switchToSection}</MenuLabel>
            {otherWorkspaces.map((item) => (
              <MenuItem
                key={item.id}
                label={item.name}
                data-workspace-id={item.id}
                onSelect={() => onWorkspaceSelect(item.id)}
              >
                {renderWorkspaceItem(item, resolvedLabels)}
              </MenuItem>
            ))}
          </>
        ) : null}

        <MenuSeparator />
        {enableWorkspaceCreation ? (
          <MenuItem
            label={resolvedLabels.createAction}
            data-testid="dashboard-workspace-create"
            onSelect={onCreateWorkspace}
          >
            <div className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4 text-muted-foreground" />
              <span>{resolvedLabels.createAction}</span>
            </div>
          </MenuItem>
        ) : (
          <>
            <MenuItem
              disabled
              data-testid="dashboard-workspace-create-disabled"
            >
              {resolvedLabels.createUnavailableAction}
            </MenuItem>
            <p className="px-3 py-2 text-xs text-muted-foreground">
              {workspaceCreationDisabledMessage}
            </p>
          </>
        )}
      </MenuContent>
    </Menu>
  );
}

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
