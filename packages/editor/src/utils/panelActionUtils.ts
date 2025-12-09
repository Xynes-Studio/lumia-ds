/**
 * Pure utility functions and constants for Panel Action Menu.
 * Extracted from PanelActionMenuPlugin for testability.
 */

import { LexicalNode } from 'lexical';
import React from 'react';
import {
  $isPanelBlockNode,
  PanelBlockNode,
  PanelVariant,
} from '../nodes/PanelBlockNode/PanelBlockNode';
import { Info, AlertTriangle, CheckCircle, StickyNote } from 'lucide-react';

/**
 * Panel variant configuration with labels, icons, and colors.
 */
export const PANEL_VARIANTS: {
  variant: PanelVariant;
  label: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { variant: 'info', label: 'Info', icon: Info, color: 'text-blue-500' },
  {
    variant: 'warning',
    label: 'Warning',
    icon: AlertTriangle,
    color: 'text-yellow-500',
  },
  {
    variant: 'success',
    label: 'Success',
    icon: CheckCircle,
    color: 'text-green-500',
  },
  { variant: 'note', label: 'Note', icon: StickyNote, color: 'text-gray-500' },
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
