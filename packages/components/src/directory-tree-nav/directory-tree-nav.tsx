import type { KeyboardEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon, type IconId } from '@lumia-ui/icons';
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

export type DirectoryTreeNavProps = {
  rootLabel: string;
  rootHref: string;
  rootIcon?: IconId;
  rootActive?: boolean;
  activeHref?: string;
  nodes: DirectoryTreeNode[];
  expandedIds: string[];
  onExpandedIdsChange: (nextIds: string[]) => void;
  onCreateDirectory: (input: DirectoryTreeCreateInput) => void;
  maxNameLength?: number;
  onNavigate?: (href: string) => void;
  className?: string;
};

type ComposerState = {
  parentId: string | null;
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

const toggleExpandedId = (expandedIds: string[], nodeId: string) =>
  expandedIds.includes(nodeId)
    ? expandedIds.filter((item) => item !== nodeId)
    : [...expandedIds, nodeId];

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
  maxNameLength = defaultMaxNameLength,
  onNavigate,
  className,
}: DirectoryTreeNavProps) => {
  const [composer, setComposer] = useState<ComposerState | null>(null);
  const composerInputRef = useRef<HTMLInputElement | null>(null);
  const composerFocusKey = composer ? `${composer.parentId ?? 'root'}` : null;

  const expandedSet = useMemo(() => new Set(expandedIds), [expandedIds]);

  useEffect(() => {
    if (!composer) {
      return;
    }

    composerInputRef.current?.focus();
    composerInputRef.current?.select();
  }, [composerFocusKey]);

  const openComposer = (parentId: string | null) => {
    if (parentId !== null && !expandedSet.has(parentId)) {
      onExpandedIdsChange([...expandedIds, parentId]);
    }

    setComposer({
      parentId,
      value: '',
      error: null,
    });
  };

  const submitComposer = (rawNameOverride?: string) => {
    if (!composer) {
      return;
    }

    const rawNameFromInput =
      rawNameOverride ?? composerInputRef.current?.value ?? composer.value;

    const validation = validateDirectoryName({
      nodes,
      parentId: composer.parentId,
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

    onCreateDirectory({
      parentId: composer.parentId,
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

  const renderComposer = (parentId: string | null, depth: number) => {
    if (!composer || composer.parentId !== parentId) {
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

  const renderNodes = (items: DirectoryTreeNode[], depth: number) => {
    if (items.length === 0) {
      return null;
    }

    return (
      <ul className="space-y-1" data-depth={depth}>
        {items.map((node) => {
          const hasChildren = Boolean(node.children?.length);
          const isExpanded = expandedSet.has(node.id);
          const isActive = activeHref === node.href;
          const rowPadding =
            depth > 0 ? 'ml-3 border-l border-border/60 pl-3' : '';

          return (
            <li
              key={node.id}
              className={cn('space-y-1', rowPadding)}
              data-testid={`directory-tree-node-${node.id}`}
            >
              <div className="group flex items-center gap-1">
                <button
                  type="button"
                  className={cn(
                    baseItemClasses,
                    isActive ? activeItemClasses : inactiveItemClasses,
                    'flex-1',
                  )}
                  onClick={() => {
                    if (hasChildren) {
                      onExpandedIdsChange(
                        toggleExpandedId(expandedIds, node.id),
                      );
                    }

                    if (node.href && onNavigate) {
                      onNavigate(node.href);
                    }
                  }}
                  aria-expanded={hasChildren ? isExpanded : undefined}
                  aria-current={isActive ? 'page' : undefined}
                  data-testid={`directory-tree-node-label-${node.id}`}
                >
                  <Icon name="folder" size={16} aria-hidden="true" />
                  <span className="truncate">{node.label}</span>
                </button>

                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground opacity-0 transition hover:bg-muted hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 group-hover:opacity-100 group-focus-within:opacity-100 ring-offset-background"
                  aria-label={`Create subdirectory in ${node.label}`}
                  onClick={() => openComposer(node.id)}
                  data-testid={`directory-tree-create-${node.id}`}
                >
                  <Icon name="add" size={14} />
                </button>
              </div>

              {isExpanded && node.children?.length
                ? renderNodes(node.children, depth + 1)
                : null}
              {renderComposer(node.id, depth + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className={cn('space-y-1', className)}>
      <div className="group flex items-center gap-0.5">
        <a
          href={rootHref}
          className={cn(
            baseItemClasses,
            rootActive ? activeItemClasses : inactiveItemClasses,
            'flex-1',
          )}
          aria-current={rootActive ? 'page' : undefined}
          onClick={(event) => {
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

        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ring-offset-background"
          aria-label={`Create directory in ${rootLabel}`}
          onClick={() => openComposer(null)}
          data-testid="directory-tree-create-root"
        >
          <Icon name="add" size={14} />
        </button>
      </div>

      <div className="space-y-1">
        <div className="pl-6">
          {renderComposer(null, 0)}
          {renderNodes(nodes, 0)}
        </div>
      </div>
    </div>
  );
};

export type { DirectoryTreeNode } from './directory-tree-nav.utils';
