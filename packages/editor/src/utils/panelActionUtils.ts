/**
 * Pure utility functions and constants for Panel Action Menu.
 * Extracted from PanelActionMenuPlugin for testability.
 */

import { LexicalNode } from 'lexical';
import {
  $isPanelBlockNode,
  PanelBlockNode,
  PanelVariant,
} from '../nodes/PanelBlockNode/PanelBlockNode';

/**
 * Default variant for new panels.
 * Used by toolbar Insert Panel button and `/panel` slash command per BUG-LDS-6
 * (insert with default + change inline via the per-panel popover).
 */
export const DEFAULT_PANEL_VARIANT: PanelVariant = 'info';

/**
 * Default title for new panels (matches the default variant).
 */
export const DEFAULT_PANEL_TITLE = 'Info Panel';

/**
 * Panel variant configuration with labels, Lumia icon IDs, and colors.
 *
 * BUG-LDS-6: `iconName` is the canonical Lumia icon ID consumed by
 * `<Icon name={iconName} />` from `@lumia-ui/icons`. The editor surface MUST
 * NOT import icon components from `lucide-react` directly — see
 * `scripts/audit-icon-sources.ts`.
 */
export const PANEL_VARIANTS: {
  variant: PanelVariant;
  label: string;
  /** Lumia icon registry ID (see `@lumia-ui/icons` default-icons). */
  iconName: string;
  /** Tailwind text-color class applied to the icon. */
  color: string;
}[] = [
  {
    variant: 'info',
    label: 'Info',
    iconName: 'info',
    color: 'text-blue-500',
  },
  {
    variant: 'warning',
    label: 'Warning',
    iconName: 'alert',
    color: 'text-yellow-500',
  },
  {
    variant: 'success',
    label: 'Success',
    iconName: 'circle-check',
    color: 'text-green-500',
  },
  {
    variant: 'note',
    label: 'Note',
    iconName: 'file-text',
    color: 'text-gray-500',
  },
];

/**
 * Get variant config by variant type.
 * @param variant - The panel variant
 * @returns The variant config or undefined
 */
export function getVariantConfig(variant: PanelVariant) {
  return PANEL_VARIANTS.find((v) => v.variant === variant);
}

/**
 * Get all variant types.
 * @returns Array of variant types
 */
export function getVariantTypes(): PanelVariant[] {
  return PANEL_VARIANTS.map((v) => v.variant);
}

/**
 * Get variant label.
 * @param variant - The panel variant
 * @returns The label or the variant itself if not found
 */
export function getVariantLabel(variant: PanelVariant): string {
  const config = getVariantConfig(variant);
  return config?.label ?? variant;
}

/**
 * Get variant color class.
 * @param variant - The panel variant
 * @returns The color class or empty string
 */
export function getVariantColor(variant: PanelVariant): string {
  const config = getVariantConfig(variant);
  return config?.color ?? '';
}

/**
 * Get the Lumia icon ID for a variant.
 * Returns `'info'` for unknown variants (fail-safe default — never throws).
 */
export function getVariantIconName(variant: PanelVariant): string {
  const config = getVariantConfig(variant);
  return config?.iconName ?? 'info';
}

/**
 * Check if a variant is valid.
 * @param variant - The variant to check
 * @returns True if valid
 */
export function isValidVariant(variant: string): variant is PanelVariant {
  return getVariantTypes().includes(variant as PanelVariant);
}

/**
 * Get panel node from any Lexical node by traversing up the tree.
 * @param node - The starting node
 * @returns The panel block node or null
 */
export function $getPanelNodeFromLexicalNode(
  node: LexicalNode,
): PanelBlockNode | null {
  let current: LexicalNode | null = node;
  while (current !== null) {
    if ($isPanelBlockNode(current)) {
      return current;
    }
    current = current.getParent();
  }
  return null;
}

/**
 * Calculate menu position relative to an element.
 * @param element - The reference element
 * @param offset - The offset from the element
 * @returns Position object
 */
export function calculateMenuPosition(
  element: HTMLElement | null,
  offset: { top?: number; right?: number } = {},
): { top: number; left: number } | null {
  if (!element) return null;

  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + (offset.top ?? 0),
    left: rect.right - (offset.right ?? 0),
  };
}

/**
 * Validate panel title.
 * @param title - The title to validate
 * @returns Sanitized title
 */
export function sanitizePanelTitle(title: string): string {
  return title.trim();
}

/**
 * Check if title has changed.
 * @param oldTitle - The old title
 * @param newTitle - The new title
 * @returns True if changed
 */
export function hasTitleChanged(oldTitle: string, newTitle: string): boolean {
  return sanitizePanelTitle(oldTitle) !== sanitizePanelTitle(newTitle);
}
