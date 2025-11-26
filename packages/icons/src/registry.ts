import { seedDefaultIcons } from './default-icons';
import { registerGeneratedIcons } from './generated/registry';
import type { IconComponent, IconId, RegisterIconFn } from './types';

const iconRegistry = new Map<IconId, IconComponent>();

export const registerIcon: RegisterIconFn = (id, component) => {
  iconRegistry.set(id, component);
};

export function getIcon(id: IconId): IconComponent | undefined {
  return iconRegistry.get(id);
}

/**
 * Clears the registry. Useful for tests to keep state isolated. This also
 * removes the default and generated icons until resetIconRegistry is called.
 */
export function clearIconRegistry() {
  iconRegistry.clear();
}

function seedIconRegistry() {
  clearIconRegistry();
  seedDefaultIcons(registerIcon);
  registerGeneratedIcons(registerIcon);
}

export function resetIconRegistry() {
  seedIconRegistry();
}

seedIconRegistry();
