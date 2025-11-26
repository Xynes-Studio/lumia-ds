import type { ComponentType, SVGProps } from 'react';

export type IconId = string;

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const iconRegistry = new Map<IconId, IconComponent>();

export function registerIcon(id: IconId, component: IconComponent) {
  iconRegistry.set(id, component);
}

export function getIcon(id: IconId): IconComponent | undefined {
  return iconRegistry.get(id);
}

/**
 * Clears the registry. Useful for tests to keep state isolated.
 */
export function clearIconRegistry() {
  iconRegistry.clear();
}
