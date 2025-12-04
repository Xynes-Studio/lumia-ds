import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Filter,
  LayoutGrid,
  List,
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
import type { IconComponent, RegisterIconFn } from './types';

export const defaultIconComponents = {
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
  'layout-grid': LayoutGrid,
  list: List,
  'chevron-up': ChevronUp,
  'chevron-down': ChevronDown,
} satisfies Record<string, IconComponent>;

export function seedDefaultIcons(registerIcon: RegisterIconFn) {
  Object.entries(defaultIconComponents).forEach(([id, component]) => {
    registerIcon(id, component);
  });
}
