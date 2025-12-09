import type { FC, SVGProps } from 'react';
import { Icon } from '../icon';
import type { IconColor } from '../icon/colorUtils';
import type { IconSize } from '../icon/sizeUtils';

/**
 * Development/test-only warning flag to avoid duplicate warnings
 */
const warnedIcons = new Set<string>();

/**
 * Clears the warned icons set (for testing purposes)
 */
export function clearWarnedIcons(): void {
  warnedIcons.clear();
}

/**
 * Logs a deprecation warning for legacy icon usage (non-production only)
 */
function warnDeprecatedIcon(iconName: string, componentName: string): void {
  if (
    // eslint-disable-next-line no-undef
    process.env.NODE_ENV !== 'production' &&
    !warnedIcons.has(componentName)
  ) {
    warnedIcons.add(componentName);
    console.warn(
      `[@lumia-ui/icons] ${componentName} is deprecated. ` +
        `Use <Icon name="${iconName}" /> instead. ` +
        `See https://lumia-ds.dev/docs/icon-migration for migration guide.`,
    );
  }
}

/**
 * Props for deprecated icon components
 * These mirror common SVG props consumers may use
 */
export interface DeprecatedIconProps extends SVGProps<SVGSVGElement> {
  /** @deprecated Use size prop instead */
  className?: string;
  /** Size of the icon */
  size?: IconSize;
  /** Color preset or custom color */
  color?: IconColor;
}

/**
 * Creates a deprecated icon component that wraps the new Icon component
 * and logs a warning in development mode.
 *
 * @param iconName - The registry name for the icon
 * @param componentName - The original component name for the warning message
 */
export function createDeprecatedIcon(
  iconName: string,
  componentName: string,
): FC<DeprecatedIconProps> {
  const DeprecatedIcon: FC<DeprecatedIconProps> = ({
    className,
    size = 'md',
    color = 'default',
    ...props
  }) => {
    warnDeprecatedIcon(iconName, componentName);

    return (
      <Icon
        name={iconName}
        size={size}
        color={color}
        className={className}
        {...props}
      />
    );
  };

  DeprecatedIcon.displayName = `Deprecated(${componentName})`;

  return DeprecatedIcon;
}

// ============================================
// Legacy Icon Exports (Deprecated)
// ============================================
// These exports maintain backward compatibility with older import patterns.
// They will log deprecation warnings in development mode.

/** @deprecated Use `<Icon name="home" />` instead */
export const IconHome = createDeprecatedIcon('home', 'IconHome');

/** @deprecated Use `<Icon name="user" />` instead */
export const IconUser = createDeprecatedIcon('user', 'IconUser');

/** @deprecated Use `<Icon name="users" />` instead */
export const IconUsers = createDeprecatedIcon('users', 'IconUsers');

/** @deprecated Use `<Icon name="settings" />` instead */
export const IconSettings = createDeprecatedIcon('settings', 'IconSettings');

/** @deprecated Use `<Icon name="reports" />` instead */
export const IconReports = createDeprecatedIcon('reports', 'IconReports');

/** @deprecated Use `<Icon name="add" />` instead */
export const IconAdd = createDeprecatedIcon('add', 'IconAdd');

/** @deprecated Use `<Icon name="edit" />` instead */
export const IconEdit = createDeprecatedIcon('edit', 'IconEdit');

/** @deprecated Use `<Icon name="delete" />` instead */
export const IconDelete = createDeprecatedIcon('delete', 'IconDelete');

/** @deprecated Use `<Icon name="filter" />` instead */
export const IconFilter = createDeprecatedIcon('filter', 'IconFilter');

/** @deprecated Use `<Icon name="search" />` instead */
export const IconSearch = createDeprecatedIcon('search', 'IconSearch');

/** @deprecated Use `<Icon name="check" />` instead (not to be confused with generated IconCheck) */
export const IconCheckCircle = createDeprecatedIcon('check', 'IconCheckCircle');

/** @deprecated Use `<Icon name="alert" />` instead */
export const IconAlert = createDeprecatedIcon('alert', 'IconAlert');

/** @deprecated Use `<Icon name="info" />` instead */
export const IconInfo = createDeprecatedIcon('info', 'IconInfo');

/** @deprecated Use `<Icon name="layout-grid" />` instead */
export const IconLayoutGrid = createDeprecatedIcon(
  'layout-grid',
  'IconLayoutGrid',
);

/** @deprecated Use `<Icon name="list" />` instead */
export const IconList = createDeprecatedIcon('list', 'IconList');

/** @deprecated Use `<Icon name="chevron-up" />` instead */
export const IconChevronUp = createDeprecatedIcon(
  'chevron-up',
  'IconChevronUp',
);

/** @deprecated Use `<Icon name="chevron-down" />` instead */
export const IconChevronDown = createDeprecatedIcon(
  'chevron-down',
  'IconChevronDown',
);

// Editor toolbar icons
/** @deprecated Use `<Icon name="bold" />` instead */
export const IconBold = createDeprecatedIcon('bold', 'IconBold');

/** @deprecated Use `<Icon name="italic" />` instead */
export const IconItalic = createDeprecatedIcon('italic', 'IconItalic');

/** @deprecated Use `<Icon name="underline" />` instead */
export const IconUnderline = createDeprecatedIcon('underline', 'IconUnderline');

/** @deprecated Use `<Icon name="code" />` instead */
export const IconCode = createDeprecatedIcon('code', 'IconCode');

/** @deprecated Use `<Icon name="link" />` instead */
export const IconLink = createDeprecatedIcon('link', 'IconLink');

/** @deprecated Use `<Icon name="trash" />` instead */
export const IconTrash = createDeprecatedIcon('trash', 'IconTrash');

/** @deprecated Use `<Icon name="external-link" />` instead */
export const IconExternalLink = createDeprecatedIcon(
  'external-link',
  'IconExternalLink',
);

/** @deprecated Use `<Icon name="file-code" />` instead */
export const IconFileCode = createDeprecatedIcon('file-code', 'IconFileCode');

/** @deprecated Use `<Icon name="list-ordered" />` instead */
export const IconListOrdered = createDeprecatedIcon(
  'list-ordered',
  'IconListOrdered',
);
