import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { SlashCommand } from './slashCommands';

interface SlashMenuProps {
  commands: SlashCommand[];
  onSelect: (command: SlashCommand) => void;
  onClose: () => void;
  /**
   * Anchor position in viewport coordinates. For BUG-LDS-5 / Bug A, the menu
   * uses this as the caret's bottom-left corner and resolves its own final
   * position to keep the menu inside the viewport (flip above when there is
   * insufficient space below; cap max-height + scroll when even the flipped
   * placement cannot fit; clamp horizontally to the viewport).
   */
  position: { top: number; left: number };
}

/**
 * Minimum pixels we leave between the menu and the viewport edges. Matches the
 * `padding: 8` middleware we would otherwise pass to Floating-UI `shift`.
 */
const VIEWPORT_PADDING = 8;

/**
 * Caret height assumed for the flip-above calculation. We use a conservative
 * default because the consumer-passed `position.top` is the BOTTOM of the
 * caret rect; to find the TOP of the caret we subtract this. Real editor
 * caret heights are typically 18–24 px.
 */
const CARET_HEIGHT_ESTIMATE = 20;

interface ResolvedPlacement {
  top: number;
  left: number;
  maxHeight: number;
}

/**
 * Resolve viewport-aware placement for the slash menu.
 *
 * Pure function so it can be unit-tested without DOM measurement.
 *
 * @param anchor   Caret anchor (bottom-left of the caret rect).
 * @param menuRect Natural menu size (`offsetWidth` / `offsetHeight`).
 * @param viewport Viewport dimensions (`innerWidth` / `innerHeight`).
 * @returns Final top/left + max-height (caps internal scroll when needed).
 */
export function resolveSlashMenuPlacement(
  anchor: { top: number; left: number },
  menuRect: { width: number; height: number },
  viewport: { width: number; height: number },
): ResolvedPlacement {
  // Sanitize NaN / Infinity / negative dimensions defensively.
  const menuWidth = Math.max(
    0,
    Number.isFinite(menuRect.width) ? menuRect.width : 0,
  );
  const menuHeight = Math.max(
    0,
    Number.isFinite(menuRect.height) ? menuRect.height : 0,
  );
  const viewportWidth = Math.max(
    0,
    Number.isFinite(viewport.width) ? viewport.width : 0,
  );
  const viewportHeight = Math.max(
    0,
    Number.isFinite(viewport.height) ? viewport.height : 0,
  );

  const spaceBelow = Math.max(
    0,
    viewportHeight - anchor.top - VIEWPORT_PADDING,
  );
  // For the "above" placement we open above the caret top, which is the anchor
  // top minus the caret height estimate.
  const caretTop = Math.max(0, anchor.top - CARET_HEIGHT_ESTIMATE);
  const spaceAbove = Math.max(0, caretTop - VIEWPORT_PADDING);

  let top: number;
  let maxHeight: number;

  if (menuHeight <= spaceBelow) {
    // Natural position fits below the caret.
    top = anchor.top;
    maxHeight = spaceBelow;
  } else if (spaceAbove >= spaceBelow) {
    // Flip above the caret. Anchor the menu's bottom at caretTop.
    const cappedHeight = Math.min(menuHeight, spaceAbove);
    top = caretTop - cappedHeight;
    maxHeight = spaceAbove;
  } else {
    // Below has more room than above even though menu is taller than below.
    // Stay below and cap to available space (internal scroll handles overflow).
    top = anchor.top;
    maxHeight = spaceBelow;
  }

  // Cross-axis (left) clamp: keep the menu fully inside the viewport.
  let left = anchor.left;
  if (viewportWidth > 0 && menuWidth > 0) {
    const maxLeft = viewportWidth - menuWidth - VIEWPORT_PADDING;
    if (left > maxLeft) {
      left = Math.max(VIEWPORT_PADDING, maxLeft);
    }
    if (left < VIEWPORT_PADDING) {
      left = VIEWPORT_PADDING;
    }
  } else if (left < VIEWPORT_PADDING) {
    left = VIEWPORT_PADDING;
  }

  // Final defense: never let top go negative or below the viewport.
  if (top < VIEWPORT_PADDING) {
    top = VIEWPORT_PADDING;
  }
  if (
    viewportHeight > 0 &&
    top + Math.min(menuHeight, maxHeight) > viewportHeight - VIEWPORT_PADDING
  ) {
    // Shouldn't happen given the above branches, but guard against rounding.
    top = Math.max(
      VIEWPORT_PADDING,
      viewportHeight - maxHeight - VIEWPORT_PADDING,
    );
  }

  // Floor maxHeight at a small positive number so the menu never renders 0px tall.
  if (maxHeight < 1) {
    maxHeight = Math.max(
      1,
      Math.min(menuHeight, viewportHeight - 2 * VIEWPORT_PADDING),
    );
  }

  return { top, left, maxHeight };
}

export function SlashMenu({
  commands,
  onSelect,
  onClose,
  position,
}: SlashMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // BUG-LDS-5 / Bug A: resolved (viewport-aware) placement. We start with the
  // anchor and refine via `useLayoutEffect` once we can measure the rendered
  // menu's natural size. Re-measure on commands change (filter narrows/widens
  // the menu height), viewport resize, and scroll.
  const [placement, setPlacement] = useState<ResolvedPlacement>(() => ({
    top: position.top,
    left: position.left,
    // Use a generous default so the first paint isn't clipped before measure.
    maxHeight: typeof window !== 'undefined' ? window.innerHeight : 600,
  }));

  useEffect(() => {
    // Reset selection when commands change
    setSelectedIndex(0);
  }, [commands]);

  useEffect(() => {
    if (commands.length === 0) {
      return;
    }

    const selectedItem = itemRefs.current[selectedIndex];
    selectedItem?.scrollIntoView({
      block: 'nearest',
    });
  }, [commands.length, selectedIndex]);

  // BUG-LDS-5 / Bug A: viewport-aware placement resolver. Runs after layout so
  // we can measure the menu's natural size, then again on viewport resize
  // and scroll. Uses `useLayoutEffect` to avoid a visible jump.
  useLayoutEffect(() => {
    if (commands.length === 0) {
      return;
    }
    if (!menuRef.current) {
      return;
    }

    const measure = () => {
      if (!menuRef.current) return;
      const resolved = resolveSlashMenuPlacement(
        position,
        {
          width: menuRef.current.offsetWidth,
          height: menuRef.current.offsetHeight,
        },
        {
          width: typeof window !== 'undefined' ? window.innerWidth : 0,
          height: typeof window !== 'undefined' ? window.innerHeight : 0,
        },
      );
      setPlacement(resolved);
    };

    measure();

    if (typeof window === 'undefined') {
      return;
    }
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [commands.length, position.top, position.left]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => (prev + 1) % commands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex(
          (prev) => (prev - 1 + commands.length) % commands.length,
        );
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        if (commands[selectedIndex]) {
          onSelect(commands[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    },
    [commands, selectedIndex, onSelect, onClose],
  );

  useEffect(() => {
    if (commands.length === 0) {
      return;
    }

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [commands.length, handleKeyDown]);

  // Close menu when clicking outside
  useEffect(() => {
    if (commands.length === 0) {
      return;
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [commands.length, onClose]);

  if (commands.length === 0) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className="slash-menu"
      style={{
        position: 'fixed',
        top: placement.top,
        left: placement.left,
        // BUG-LDS-5 / Bug A: cap to the resolved max-height so the menu
        // scrolls internally rather than being clipped by the viewport.
        maxHeight: placement.maxHeight,
        zIndex: 1000,
      }}
      role="listbox"
      aria-label="Slash commands"
    >
      <div className="slash-menu-content">
        {commands.map((command, index) => {
          const Icon = command.icon;
          return (
            <button
              key={command.name}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              className={`slash-menu-item ${index === selectedIndex ? 'slash-menu-item-selected' : ''}`}
              onClick={() => onSelect(command)}
              onMouseEnter={() => setSelectedIndex(index)}
              type="button"
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className="slash-menu-item-icon">
                <Icon className="h-4 w-4" />
              </div>
              <div className="slash-menu-item-content">
                <div className="slash-menu-item-label">{command.label}</div>
                <div className="slash-menu-item-description">
                  {command.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
