import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Filter,
  Home,
  Info,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash2,
  User,
  Users,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const defaultIconComponents = {
  home: Home,
  user: User,
  users: Users,
  settings: Settings,
  reports: BarChart3,
  add: Plus,
  edit: Pencil,
  delete: Trash2,
  filter: Filter,
  search: Search,
  check: CheckCircle2,
  alert: AlertTriangle,
  info: Info,
} satisfies Record<string, IconComponent>;

type DefaultIconId = keyof typeof defaultIconComponents;

export type IconId = DefaultIconId | (string & {});

const iconRegistry = new Map<IconId, IconComponent>();

function seedDefaultIcons() {
  Object.entries(defaultIconComponents).forEach(([id, component]) => {
    iconRegistry.set(id as IconId, component);
  });
}

seedDefaultIcons();

export function registerIcon(id: IconId, component: IconComponent) {
  iconRegistry.set(id, component);
}

export function getIcon(id: IconId): IconComponent | undefined {
  return iconRegistry.get(id);
}

/**
 * Clears the registry. Useful for tests to keep state isolated. This also
 * removes the default icons until resetIconRegistry is called.
 */
export function clearIconRegistry() {
  iconRegistry.clear();
}

export function resetIconRegistry() {
  clearIconRegistry();
  seedDefaultIcons();
}

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'id'> & {
  id: IconId;
  size?: number;
  className?: string;
};

export function Icon({ id, size = 24, className, ...props }: IconProps) {
  const IconFromRegistry = getIcon(id);

  if (!IconFromRegistry) {
    return null;
  }

  const mergedClassName = className
    ? `fill-current ${className}`.trim()
    : 'fill-current';

  return (
    <IconFromRegistry size={size} className={mergedClassName} {...props} />
  );
}
