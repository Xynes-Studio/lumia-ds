import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@lumia-ui/components';
import { Icon } from '@lumia-ui/icons';
import {
  $isPanelBlockNode,
  PanelBlockNode,
  PanelVariant,
} from '../../nodes/PanelBlockNode/PanelBlockNode';
import {
  PANEL_VARIANTS,
  getVariantColor,
  getVariantIconName,
  getVariantLabel,
} from '../../utils/panelActionUtils';

/**
 * PanelActionMenuPlugin (BUG-LDS-6, Path 2 — sibling overlay layer).
 *
 * Why this exists:
 *   The author needs an in-place affordance to change a panel's variant
 *   (info / warning / success / note) after insert, and the variant
 *   icon must come from `@lumia-ui/icons` per UXR-3. The naive option
 *   — rendering the trigger inside the panel's DOM subtree — collides
 *   with Lexical's reconciler: any non-Lexical children inside an
 *   ElementNode's DOM are subject to `$reconcileChildren`, which can
 *   wipe React-portaled subtrees and trigger
 *   `NotFoundError: The node to be removed is not a child of this node`.
 *
 * Architecture:
 *   - The plugin attaches a SINGLE `.panel-chrome-layer` div as a
 *     SIBLING of the editor's contenteditable root (NOT a child of it).
 *     Living outside the contenteditable means Lexical's reconciler
 *     never traverses it.
 *   - For each tracked `PanelBlockNode`, the plugin renders a
 *     `.panel-chrome-trigger` button inside the layer. Position is
 *     computed once per render frame from
 *     `panel.getBoundingClientRect()` translated into the layer's
 *     coordinate space.
 *   - A single `ResizeObserver` on the editor root + a single scroll
 *     listener on the nearest scrollable ancestor (or `window`)
 *     recompute positions in a single rAF tick. No per-trigger
 *     listeners.
 *   - State updates from Lexical (`registerMutationListener` +
 *     `registerUpdateListener`) refresh the descriptor snapshot so
 *     variant / title / position stay in sync with the editor state.
 */

interface PanelDescriptor {
  key: string;
  panelElement: HTMLElement;
  variant: PanelVariant;
  title: string;
  // Position relative to the layer (already translated into layer space).
  top: number;
  left: number;
}

interface PanelHeaderTriggerProps {
  descriptor: PanelDescriptor;
  onVariantChange: (
    panelKey: string,
    variant: PanelVariant,
    label: string,
  ) => void;
  onTitleSave: (panelKey: string, title: string) => void;
}

function PanelHeaderTrigger({
  descriptor,
  onVariantChange,
  onTitleSave,
}: PanelHeaderTriggerProps) {
  const { key: panelKey, variant, title, top, left } = descriptor;
  const [isOpen, setIsOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const draftTitleRef = useRef(title);

  // Sync controlled title input with the external Lexical title while
  // the popover is closed.
  useEffect(() => {
    if (!isOpen) {
      setDraftTitle(title);
      draftTitleRef.current = title;
    }
  }, [title, isOpen]);

  const handlePopoverChange = useCallback(
    (open: boolean) => {
      if (!open && draftTitleRef.current !== title) {
        onTitleSave(panelKey, draftTitleRef.current);
      }
      setIsOpen(open);
    },
    [onTitleSave, panelKey, title],
  );

  const handleVariantClick = useCallback(
    (next: PanelVariant) => {
      const label = getVariantLabel(next);
      onVariantChange(panelKey, next, label);
    },
    [onVariantChange, panelKey],
  );

  return (
    <div
      className="panel-chrome-trigger"
      data-panel-key={panelKey}
      style={{ top: `${top}px`, left: `${left}px` }}
    >
      <Popover open={isOpen} onOpenChange={handlePopoverChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Change panel type (currently ${variant})`}
            title={`Change panel type — ${getVariantLabel(variant)}`}
            data-lumia-component="panel-variant-trigger"
            data-current-variant={variant}
            className={[
              'h-7 w-7 p-0 rounded-md',
              'inline-flex items-center justify-center',
              'hover:bg-background/60 hover:ring-1 hover:ring-border',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
              'transition-colors',
              getVariantColor(variant),
            ].join(' ')}
          >
            <Icon name={getVariantIconName(variant)} size="md" />
          </Button>
        </PopoverTrigger>
        {title ? (
          <span
            className="panel-chrome-title"
            data-panel-title="true"
            data-current-variant={variant}
          >
            {title}
          </span>
        ) : null}
        <PopoverContent
          className="w-64 p-3"
          align="start"
          side="bottom"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            const idx = PANEL_VARIANTS.findIndex((v) => v.variant === variant);
            if (idx < 0) return;
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
              const target = PANEL_VARIANTS[(idx + 1) % PANEL_VARIANTS.length];
              if (target) {
                e.preventDefault();
                handleVariantClick(target.variant);
              }
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
              const target =
                PANEL_VARIANTS[
                  (idx - 1 + PANEL_VARIANTS.length) % PANEL_VARIANTS.length
                ];
              if (target) {
                e.preventDefault();
                handleVariantClick(target.variant);
              }
            }
          }}
        >
          <div className="space-y-3">
            <div
              className="space-y-1.5"
              role="radiogroup"
              aria-label="Panel type"
            >
              <div className="text-xs font-medium text-muted-foreground">
                Panel type
              </div>
              <div className="grid grid-cols-4 gap-1">
                {PANEL_VARIANTS.map(
                  ({ variant: v, label, iconName, color }) => {
                    const isActive = variant === v;
                    return (
                      <Button
                        key={v}
                        type="button"
                        variant="ghost"
                        size="sm"
                        role="radio"
                        aria-checked={isActive}
                        aria-label={label}
                        title={label}
                        data-variant={v}
                        className={[
                          'h-14 flex flex-col items-center justify-center gap-1 px-1',
                          'rounded-md border',
                          isActive
                            ? 'bg-accent border-primary ring-1 ring-primary'
                            : 'border-transparent hover:bg-accent/50',
                        ].join(' ')}
                        onClick={() => handleVariantClick(v)}
                      >
                        <Icon name={iconName} size="sm" className={color} />
                        <span className="text-[10px] leading-none text-muted-foreground">
                          {label}
                        </span>
                      </Button>
                    );
                  },
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor={`panel-title-${panelKey}`}
                className="text-xs font-medium text-muted-foreground"
              >
                Title (optional)
              </label>
              <Input
                id={`panel-title-${panelKey}`}
                value={draftTitle}
                onChange={(e) => {
                  setDraftTitle(e.target.value);
                  draftTitleRef.current = e.target.value;
                }}
                onBlur={() => {
                  if (draftTitleRef.current !== title) {
                    onTitleSave(panelKey, draftTitleRef.current);
                  }
                }}
                placeholder="No title"
                className="h-8 text-sm"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface PanelActionMenuProps {
  /**
   * Optional anchor for the sibling overlay layer. When supplied, the
   * `.panel-chrome-layer` div is appended as a child of `anchorElem`.
   * Otherwise the layer is appended as a sibling of the editor's
   * contenteditable root (its `parentElement`), which is the
   * recommended default and matches every BUG-LDS-3/5 plugin posture.
   */
  anchorElem?: HTMLElement;
}

export function PanelActionMenuPlugin({
  anchorElem,
}: PanelActionMenuProps = {}): React.ReactNode {
  const [editor] = useLexicalComposerContext();
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  const [panels, setPanels] = useState<PanelDescriptor[]>([]);
  // Stable refs for the scheduler so we don't tear down listeners on
  // every state change.
  const rebuildRef = useRef<() => void>(() => {});
  const rafRef = useRef<number | null>(null);

  // Create and mount the sibling overlay layer once per editor.
  useEffect(() => {
    const root = editor.getRootElement();
    const host = anchorElem ?? root?.parentElement ?? null;
    if (!host) return;

    // Ensure the host is a positioned ancestor so our layer's absolute
    // children are positioned relative to it. We don't mutate `position`
    // if the host already has one; otherwise we set `relative`.
    const computed = window.getComputedStyle(host);
    if (computed.position === 'static') {
      host.style.position = 'relative';
    }

    const layerEl = document.createElement('div');
    layerEl.className = 'panel-chrome-layer';
    layerEl.setAttribute('data-panel-chrome-layer', 'true');
    host.appendChild(layerEl);
    setLayer(layerEl);

    return () => {
      if (layerEl.parentNode) {
        layerEl.parentNode.removeChild(layerEl);
      }
      setLayer(null);
    };
  }, [editor, anchorElem]);

  // Track panel keys + maintain descriptor snapshot.
  useEffect(() => {
    if (!layer) return;
    const trackedKeys = new Set<string>();

    const rebuild = () => {
      const root = editor.getRootElement();
      const host = layer.parentElement;
      if (!root || !host) {
        setPanels([]);
        return;
      }
      const hostRect = host.getBoundingClientRect();
      editor.getEditorState().read(() => {
        const descriptors: PanelDescriptor[] = [];
        for (const key of trackedKeys) {
          const node = $getNodeByKey(key);
          if (!$isPanelBlockNode(node)) continue;
          const panelEl = editor.getElementByKey(key);
          if (!panelEl) continue;
          const rect = panelEl.getBoundingClientRect();
          // Place the trigger inside the panel's top-left padding zone.
          // The panel reserves `padding-left: 3.5rem` for this. Trigger
          // is ~28px square; centre it in the 56px padding column,
          // ~10px from the top edge.
          const top = rect.top - hostRect.top + 8;
          const left = rect.left - hostRect.left + 12;
          descriptors.push({
            key,
            panelElement: panelEl as HTMLElement,
            variant: (node as PanelBlockNode).getVariant(),
            title: (node as PanelBlockNode).getTitle() ?? '',
            top,
            left,
          });
        }
        setPanels(descriptors);
      });
    };
    rebuildRef.current = rebuild;

    const unregisterMutation = editor.registerMutationListener(
      PanelBlockNode,
      (mutations) => {
        for (const [key, type] of mutations) {
          if (type === 'destroyed') {
            trackedKeys.delete(key);
          } else {
            trackedKeys.add(key);
          }
        }
        rebuild();
      },
      { skipInitialization: false },
    );

    const unregisterUpdate = editor.registerUpdateListener(() => {
      rebuild();
    });

    return () => {
      unregisterMutation();
      unregisterUpdate();
    };
  }, [editor, layer]);

  // rAF-throttled reposition on scroll / resize. One listener on the
  // editor root via ResizeObserver, one on the nearest scrollable
  // ancestor (or window) for scroll.
  useEffect(() => {
    if (!layer) return;
    const root = editor.getRootElement();
    if (!root) return;

    const schedule = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        rebuildRef.current();
      });
    };

    const scrollables: Array<Window | HTMLElement> = [window];
    let walker: HTMLElement | null = root;
    while (walker) {
      const overflowY = window.getComputedStyle(walker).overflowY;
      if (
        overflowY === 'auto' ||
        overflowY === 'scroll' ||
        overflowY === 'overlay'
      ) {
        scrollables.push(walker);
      }
      walker = walker.parentElement;
    }

    for (const target of scrollables) {
      target.addEventListener('scroll', schedule, { passive: true });
    }
    window.addEventListener('resize', schedule, { passive: true });

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(schedule);
      ro.observe(root);
    }

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      for (const target of scrollables) {
        target.removeEventListener('scroll', schedule);
      }
      window.removeEventListener('resize', schedule);
      if (ro) ro.disconnect();
    };
  }, [editor, layer]);

  const handleVariantChange = useCallback(
    (panelKey: string, variant: PanelVariant, label: string) => {
      editor.update(
        () => {
          const node = $getNodeByKey(panelKey);
          if (!$isPanelBlockNode(node)) return;
          (node as PanelBlockNode).setVariant(variant);
          (node as PanelBlockNode).setIcon(variant);
          const oldTitle = (node as PanelBlockNode).getTitle() || '';
          if (
            oldTitle === '' ||
            oldTitle.endsWith(' Panel') ||
            ['Info', 'Warning', 'Success', 'Note'].includes(oldTitle)
          ) {
            (node as PanelBlockNode).setTitle(`${label} Panel`);
          }
        },
        { discrete: true },
      );
    },
    [editor],
  );

  const handleTitleSave = useCallback(
    (panelKey: string, title: string) => {
      editor.update(
        () => {
          const node = $getNodeByKey(panelKey);
          if ($isPanelBlockNode(node)) {
            (node as PanelBlockNode).setTitle(title);
          }
        },
        { discrete: true },
      );
    },
    [editor],
  );

  if (!layer || panels.length === 0) return null;

  return createPortal(
    <>
      {panels.map((p) => (
        <PanelHeaderTrigger
          key={p.key}
          descriptor={p}
          onVariantChange={handleVariantChange}
          onTitleSave={handleTitleSave}
        />
      ))}
    </>,
    layer,
  );
}
