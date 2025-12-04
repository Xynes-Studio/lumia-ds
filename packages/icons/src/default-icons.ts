import {
  AlertTriangle,
  AlignCenter,
  AlignLeft,
  AlignRight,
  BarChart3,
  Bold,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code,
  Filter,
  Italic,
  LayoutGrid,
  List,
  ListOrdered,
  Home,
  Info,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash2,
  Underline,
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
  bold: Bold,
  italic: Italic,
  underline: Underline,
  code: Code,
  'align-left': AlignLeft,
  'align-center': AlignCenter,
  'align-right': AlignRight,
  'list-ordered': ListOrdered,
} satisfies Record<string, IconComponent>;

export function seedDefaultIcons(registerIcon: RegisterIconFn) {
  Object.entries(defaultIconComponents).forEach(([id, component]) => {
    registerIcon(id, component);
  });
}
