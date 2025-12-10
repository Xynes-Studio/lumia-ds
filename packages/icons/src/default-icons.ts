import {
  AlertTriangle,
  BarChart3,
  Bold,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code,
  ExternalLink,
  FileCode,
  Filter,
  LayoutGrid,
  Link,
  List,
  ListOrdered,
  Home,
  Info,
  Italic,
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
  // Editor toolbar icons
  bold: Bold,
  italic: Italic,
  underline: Underline,
  code: Code,
  link: Link,
  trash: Trash2,
  'external-link': ExternalLink,
  'file-code': FileCode,
  'list-ordered': ListOrdered,
} satisfies Record<string, IconComponent>;

export function seedDefaultIcons(registerIcon: RegisterIconFn) {
  Object.entries(defaultIconComponents).forEach(([id, component]) => {
    registerIcon(id, component);
  });
}
