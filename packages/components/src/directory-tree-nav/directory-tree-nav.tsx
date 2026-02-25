import type { KeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@lumia-ui/icons';
import { Button } from '../button/button';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';
import { ContextMenu, type MenuItemConfig } from '../context-menu/context-menu';
import { Input } from '../input/input';
import { cn } from '../lib/utils';
import {
  type DirectoryTreeNode,
  validateDirectoryName,
} from './directory-tree-nav.utils';

type DirectoryTreeCreateInput = {
  parentId: string | null;
  name: string;
};

type DirectoryTreeRenameInput = {
  nodeId: string;
  name: string;
};

type DirectoryTreeDeleteInput = {
  nodeId: string;
};

export type DirectoryTreeNavProps = {
  rootLabel: string;
  rootHref: string;
  rootIcon?: string;
  rootActive?: boolean;
  activeHref?: string;
  nodes: DirectoryTreeNode[];
  expandedIds: string[];
  onExpandedIdsChange: (nextIds: string[]) => void;
  onCreateDirectory: (input: DirectoryTreeCreateInput) => void;
  onRenameDirectory?: (input: DirectoryTreeRenameInput) => void;
  onDeleteDirectory?: (input: DirectoryTreeDeleteInput) => void;
  canManageDirectories?: boolean;
  directoryActionDisabledReason?: string;
  maxNameLength?: number;
  onNavigate?: (href: string) => void;
  className?: string;
};

type ComposerMode = 'create' | 'rename';

type ComposerState = {
  mode: ComposerMode;
  anchorId: string | null;
  validationParentId: string | null;
  targetNodeId: string | null;
  initialValue: string;
  value: string;
  error: string | null;
};

const baseItemClasses =
  'inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ring-offset-background';
const inactiveItemClasses =
  'text-muted-foreground hover:bg-muted hover:text-foreground';
const activeItemClasses =
  'bg-primary/10 text-primary-800 hover:bg-primary/20 focus-visible:ring-primary-600';
const defaultMaxNameLength = 80;
const defaultDirectoryAccessDisabledReason =
  'Only workspace owners can manage directories right now.';
const defaultRenameUnavailableReason =
  'Rename is unavailable until this workspace enables it.';
const defaultDeleteUnavailableReason =
  'Delete is unavailable until this workspace enables it.';
const normalizeForCompare = (value: string) => value.trim().toLocaleLowerCase();

const toggleExpandedId = (expandedIds: string[], nodeId: string) =>
  expandedIds.includes(nodeId)
    ? expandedIds.filter((item) => item !== nodeId)
    : [...expandedIds, nodeId];

type NodeContext = {
  node: DirectoryTreeNode;
  parentId: string | null;
};

const findNodePathById = (
  nodes: DirectoryTreeNode[],
  nodeId: string,
  ancestry: DirectoryTreeNode[] = [],
): DirectoryTreeNode[] | null => {
  for (const node of nodes) {
    const nextAncestry = [...ancestry, node];
    if (node.id === nodeId) {
      return nextAncestry;
    }

    if (!node.children?.length) {
      continue;
    }

    const nested = findNodePathById(node.children, nodeId, nextAncestry);
    if (nested) {
      return nested;
    }
  }

  return null;
};

const findNodeContextById = (
  nodes: DirectoryTreeNode[],
  nodeId: string,
  parentId: string | null = null,
): NodeContext | null => {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return { node, parentId };
    }

    if (!node.children?.length) {
      continue;
    }

    const nested = findNodeContextById(node.children, nodeId, node.id);
    if (nested) {
      return nested;
    }
  }

  return null;
};

export const DirectoryTreeNav = ({
  rootLabel,
  rootHref,
  rootIcon = 'file-text',
  rootActive = false,
  activeHref,
  nodes,
  expandedIds,
  onExpandedIdsChange,
  onCreateDirectory,
  onRenameDirectory,
  onDeleteDirectory,
  canManageDirectories = true,
  directoryActionDisabledReason = defaultDirectoryAccessDisabledReason,
  maxNameLength = defaultMaxNameLength,
  onNavigate,
  className,
}: DirectoryTreeNavProps) => {
  const [composer, setComposer] = useState<ComposerState | null>(null);
  const [pendingDeleteNodeId, setPendingDeleteNodeId] = useState<string | null>(
    null,
  );
  const [accessToastMessage, setAccessToastMessage] = useState<string | null>(
    null,
  );
  const composerInputRef = useRef<HTMLInputElement | null>(null);
  const composerFocusKey = composer
    ? `${composer.mode}:${composer.anchorId ?? 'root'}:${composer.targetNodeId ?? 'new'}`
    : null;

  const expandedSet = useMemo(() => new Set(expandedIds), [expandedIds]);

  useEffect(() => {
    if (!composer) {
      return;
    }

    composerInputRef.current?.focus();
    composerInputRef.current?.select();
  }, [composerFocusKey]);

  useEffect(() => {
    if (!accessToastMessage) {
      return;
    }

    const timerId = window.setTimeout(() => {
      setAccessToastMessage(null);
    }, 4000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [accessToastMessage]);

  const showAccessDeniedToast = () => {
    setAccessToastMessage(directoryActionDisabledReason);
  };

  const openCreateComposer = (parentId: string | null) => {
    if (!canManageDirectories) {
      showAccessDeniedToast();
      return;
    }

    if (parentId !== null && !expandedSet.has(parentId)) {
      onExpandedIdsChange([...expandedIds, parentId]);
    }

    setComposer({
      mode: 'create',
      anchorId: parentId,
      validationParentId: parentId,
      targetNodeId: null,
      initialValue: '',
      value: '',
      error: null,
    });
  };

  const openEditComposer = (nodeId: string) => {
    if (!canManageDirectories) {
      showAccessDeniedToast();
      return;
    }

    if (!onRenameDirectory) {
      setAccessToastMessage(defaultRenameUnavailableReason);
      return;
    }

    const context = findNodeContextById(nodes, nodeId);
    if (!context) {
      return;
    }

    setComposer({
      mode: 'rename',
      anchorId: nodeId,
      validationParentId: context.parentId,
      targetNodeId: nodeId,
      initialValue: context.node.label,
      value: context.node.label,
      error: null,
    });
  };

  const submitComposer = (rawNameOverride?: string) => {
    if (!composer) {
      return;
    }

    const rawNameFromInput =
      rawNameOverride ?? composerInputRef.current?.value ?? composer.value;

    if (composer.mode !== 'create' && !composer.targetNodeId) {
      setComposer(null);
      return;
    }

    const normalizedRawName = rawNameFromInput.trim();
    if (
      composer.mode !== 'create' &&
      normalizeForCompare(normalizedRawName) ===
        normalizeForCompare(composer.initialValue)
    ) {
      setComposer(null);
      return;
    }

    const validation = validateDirectoryName({
      nodes,
      parentId: composer.validationParentId,
      rawName: rawNameFromInput,
      maxNameLength,
    });

    if (validation.error) {
      setComposer((previous) =>
        previous
          ? {
              ...previous,
              value: rawNameFromInput,
              error: validation.error,
            }
          : previous,
      );
      return;
    }

    if (composer.mode === 'create') {
      onCreateDirectory({
        parentId: composer.validationParentId,
        name: validation.normalizedName,
      });
      setComposer(null);
      return;
    }

    if (!onRenameDirectory) {
      setAccessToastMessage(defaultRenameUnavailableReason);
      setComposer(null);
      return;
    }

    onRenameDirectory({
      nodeId: composer.targetNodeId as string,
      name: validation.normalizedName,
    });

    setComposer(null);
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      submitComposer(event.currentTarget.value);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setComposer(null);
    }
  };

  const renderCreateComposer = (parentId: string | null, depth: number) => {
    if (
      !composer ||
      composer.mode !== 'create' ||
      composer.anchorId !== parentId
    ) {
      return null;
    }

    return (
      <div
        className={cn(
          'space-y-1',
          depth > 0 && 'ml-3 border-l border-border/60 pl-3',
        )}
      >
        <div className="rounded-md bg-muted/40 p-2">
          <Input
            ref={composerInputRef}
            value={composer.value}
            maxLength={maxNameLength}
            placeholder="Directory name"
            aria-label="Directory name"
            aria-invalid={Boolean(composer.error)}
            onChange={(event) => {
              const nextValue = event.currentTarget.value;
              setComposer((previous) =>
                previous
                  ? {
                      ...previous,
                      value: nextValue,
                      error: null,
                    }
                  : previous,
              );
            }}
            onKeyDown={handleComposerKeyDown}
            data-testid="directory-tree-composer-input"
          />
          {composer.error ? (
            <p
              className="mt-1 text-xs text-destructive"
              data-testid="directory-tree-composer-error"
              aria-live="polite"
            >
              {composer.error}
            </p>
          ) : null}
        </div>
      </div>
    );
  };

  const ownerOnlySuffix = canManageDirectories ? '' : ' (Owner only)';

  const pendingDeletePath = useMemo(
    () =>
      pendingDeleteNodeId ? findNodePathById(nodes, pendingDeleteNodeId) : null,
    [nodes, pendingDeleteNodeId],
  );
  const pendingDeleteLabel = pendingDeletePath?.at(-1)?.label ?? null;
  const pendingDeleteBreadcrumb = pendingDeletePath
    ? [rootLabel, ...pendingDeletePath.map((node) => node.label)].join(' / ')
    : null;

  const guardManagedAction = (callback: () => void) => () => {
    if (!canManageDirectories) {
      showAccessDeniedToast();
      return;
    }

    callback();
  };

  const openDeleteConfirmation = (nodeId: string) => {
    if (!canManageDirectories) {
      showAccessDeniedToast();
      return;
    }

    if (!onDeleteDirectory) {
      setAccessToastMessage(defaultDeleteUnavailableReason);
      return;
    }

    if (!findNodeContextById(nodes, nodeId)) {
      return;
    }

    setPendingDeleteNodeId(nodeId);
  };

  const confirmDeleteDirectory = () => {
    if (!pendingDeleteNodeId) {
      return;
    }

    if (!onDeleteDirectory) {
      setAccessToastMessage(defaultDeleteUnavailableReason);
      return;
    }

    onDeleteDirectory({ nodeId: pendingDeleteNodeId });
    setPendingDeleteNodeId(null);
  };

  const getNodeContextMenuItems = (
    node: DirectoryTreeNode,
  ): MenuItemConfig[] => [
    {
      id: `create-${node.id}`,
      label: `Create subdirectory${ownerOnlySuffix}`,
      icon: 'add',
      onSelect: guardManagedAction(() => openCreateComposer(node.id)),
    },
    {
      id: `rename-${node.id}`,
      label: `Rename directory${ownerOnlySuffix}`,
      icon: 'edit',
      disabled: !onRenameDirectory,
      onSelect: guardManagedAction(() => openEditComposer(node.id)),
    },
    {
      id: `delete-${node.id}`,
      label: `Delete directory${ownerOnlySuffix}`,
      icon: 'delete',
      variant: 'destructive',
      disabled: !onDeleteDirectory,
      onSelect: guardManagedAction(() => openDeleteConfirmation(node.id)),
    },
  ];

  const rootContextMenuItems: MenuItemConfig[] = [
    {
      id: 'create-root',
      label: `Create directory${ownerOnlySuffix}`,
      icon: 'add',
      onSelect: guardManagedAction(() => openCreateComposer(null)),
    },
  ];

  const renderNodes = (items: DirectoryTreeNode[], depth: number) => {
    if (items.length === 0) {
      return null;
    }

    return (
      <ul className="space-y-1" data-depth={depth}>
        {items.map((node) => {
          const hasChildren = Boolean(node.children?.length);
          const isExpanded = expandedSet.has(node.id);
          const isActive =
            Boolean(node.href) &&
            Boolean(activeHref) &&
            activeHref === node.href;
          const rowPadding =
            depth > 0 ? 'ml-3 border-l border-border/60 pl-3' : '';
          const isInlineRenaming =
            composer?.mode === 'rename' && composer.anchorId === node.id;

          const handleNodeActivate = (
            event: ReactMouseEvent<HTMLButtonElement>,
          ) => {
            // On macOS, Ctrl+Click emits click; treat it as context intent.
            if (event.ctrlKey) {
              return;
            }

            if (hasChildren) {
              onExpandedIdsChange(toggleExpandedId(expandedIds, node.id));
            }

            if (node.href && onNavigate) {
              onNavigate(node.href);
            }
          };

          return (
            <li
              key={node.id}
              className={cn('space-y-1', rowPadding)}
              data-testid={`directory-tree-node-${node.id}`}
            >
              <div className="group flex items-center gap-1">
                {isInlineRenaming ? (
                  <div
                    className="flex-1 rounded-md bg-muted/40 p-1"
                    data-testid={`directory-tree-inline-composer-${node.id}`}
                  >
                    <Input
                      ref={composerInputRef}
                      value={composer.value}
                      maxLength={maxNameLength}
                      placeholder="Rename directory"
                      aria-label="Rename directory"
                      aria-invalid={Boolean(composer.error)}
                      onChange={(event) => {
                        const nextValue = event.currentTarget.value;
                        setComposer((previous) =>
                          previous
                            ? {
                                ...previous,
                                value: nextValue,
                                error: null,
                              }
                            : previous,
                        );
                      }}
                      onKeyDown={handleComposerKeyDown}
                      data-testid="directory-tree-inline-composer-input"
                    />
                  </div>
                ) : (
                  <>
                    <ContextMenu items={getNodeContextMenuItems(node)}>
                      <button
                        type="button"
                        className={cn(
                          baseItemClasses,
                          isActive ? activeItemClasses : inactiveItemClasses,
                          'flex-1',
                        )}
                        onClick={handleNodeActivate}
                        aria-expanded={hasChildren ? isExpanded : undefined}
                        aria-current={isActive ? 'page' : undefined}
                        data-testid={`directory-tree-node-label-${node.id}`}
                      >
                        <Icon name="folder" size={16} aria-hidden="true" />
                        <span className="truncate">{node.label}</span>
                      </button>
                    </ContextMenu>

                    <button
                      type="button"
                      className={cn(
                        'inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground opacity-0 transition hover:bg-muted hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 group-hover:opacity-100 group-focus-within:opacity-100 ring-offset-background',
                        !canManageDirectories &&
                          'cursor-not-allowed opacity-50 hover:bg-transparent hover:text-muted-foreground',
                      )}
                      aria-label={`Create subdirectory in ${node.label}`}
                      aria-disabled={!canManageDirectories}
                      onClick={() => openCreateComposer(node.id)}
                      data-testid={`directory-tree-create-${node.id}`}
                    >
                      <Icon name="add" size={14} />
                    </button>
                  </>
                )}
              </div>

              {isInlineRenaming && composer.error ? (
                <p
                  className="ml-1 text-xs text-destructive"
                  data-testid="directory-tree-composer-error"
                  aria-live="polite"
                >
                  {composer.error}
                </p>
              ) : null}
              {isExpanded && node.children?.length
                ? renderNodes(node.children, depth + 1)
                : null}
              {renderCreateComposer(node.id, depth + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className={cn('space-y-1', className)}>
      <div className="group flex items-center gap-0.5">
        <ContextMenu items={rootContextMenuItems}>
          <a
            href={rootHref}
            className={cn(
              baseItemClasses,
              rootActive ? activeItemClasses : inactiveItemClasses,
              'flex-1',
            )}
            aria-current={rootActive ? 'page' : undefined}
            onClick={(event) => {
              if (event.ctrlKey) {
                return;
              }

              if (!onNavigate) {
                return;
              }

              event.preventDefault();
              onNavigate(rootHref);
            }}
            data-testid="directory-tree-root-link"
          >
            <Icon name={rootIcon} size={16} aria-hidden="true" />
            <span className="truncate">{rootLabel}</span>
          </a>
        </ContextMenu>

        <button
          type="button"
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ring-offset-background',
            !canManageDirectories &&
              'cursor-not-allowed opacity-50 hover:bg-transparent hover:text-muted-foreground',
          )}
          aria-label={`Create directory in ${rootLabel}`}
          aria-disabled={!canManageDirectories}
          onClick={() => openCreateComposer(null)}
          data-testid="directory-tree-create-root"
        >
          <Icon name="add" size={14} />
        </button>
      </div>

      <div className="space-y-1">
        <div className="pl-6">
          {renderCreateComposer(null, 0)}
          {renderNodes(nodes, 0)}
        </div>
      </div>

      {accessToastMessage ? (
        <div
          data-testid="directory-tree-access-toast"
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-4 z-50 w-[22rem] rounded-md border border-border bg-background/95 p-3 shadow-lg backdrop-blur-sm"
        >
          <p className="text-sm font-medium text-foreground">
            Action unavailable
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {accessToastMessage}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled
              data-testid="directory-tree-access-request-button"
            >
              Request access
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled
              data-testid="directory-tree-access-contact-button"
            >
              Contact owner
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto"
              onClick={() => setAccessToastMessage(null)}
              aria-label="Dismiss access notice"
            >
              Dismiss
            </Button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingDeleteNodeId)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setPendingDeleteNodeId(null);
          }
        }}
        title={
          pendingDeleteLabel
            ? `Delete “${pendingDeleteLabel}”?`
            : 'Delete directory?'
        }
        description={
          <div className="space-y-3">
            {pendingDeleteBreadcrumb ? (
              <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Directory path
                </p>
                <p className="mt-1 break-words text-sm font-medium text-foreground">
                  {pendingDeleteBreadcrumb}
                </p>
              </div>
            ) : null}
            <p className="text-sm leading-5 text-foreground">
              This will permanently delete this directory, all nested
              subdirectories, and every content item inside them.
            </p>
            <p className="text-xs font-medium text-muted-foreground">
              This action cannot be undone.
            </p>
          </div>
        }
        confirmLabel="Delete directory"
        cancelLabel="Cancel"
        destructive
        onConfirm={confirmDeleteDirectory}
      />
    </div>
  );
};

export type { DirectoryTreeNode } from './directory-tree-nav.utils';
export type { DirectoryTreeDeleteInput, DirectoryTreeRenameInput };
