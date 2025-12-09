/**
 * ThemeTokens mirrors the Figma token primitives. Naming adjustments:
 * - Figma "Surface" tokens map to `colors.background`
 * - Figma "Text" tokens map to `colors.foreground`
 * - Figma "Error" maps to `colors.destructive` to match component prop naming
 */
import * as Tokens from './generated/tokens';

export type ThemeTokens = {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    border: string;
    muted: string;
    mutedForeground: string;
    ring: string;
    destructive: string;
    destructiveForeground: string;
  };
  typography: {
    families: {
      sans: string;
      mono: string;
      display: string;
    };
    sizes: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
    weights: {
      regular: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  radii: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    pill: string;
  };
  spacing: {
    xxs: string;
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  shadows: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    inset: string;
  };
};

export const defaultTheme: ThemeTokens = {
  colors: {
    primary: Tokens.ColorPrimaryBase,
    secondary: Tokens.ColorSecondary,
    background: Tokens.ColorBackground,
    foreground: Tokens.ColorForeground,
    border: Tokens.ColorBorder,
    muted: Tokens.ColorMuted,
    mutedForeground: Tokens.ColorMutedForeground,
    ring: Tokens.ColorRing,
    destructive: Tokens.ColorDestructive,
    destructiveForeground: Tokens.ColorDestructiveForeground,
  },
  typography: {
    families: {
      sans: Tokens.FontFamilySans,
      mono: Tokens.FontFamilyMono,
      display: Tokens.FontFamilyDisplay,
    },
    sizes: {
      xs: Tokens.FontSizeXs,
      sm: Tokens.FontSizeSm,
      md: Tokens.FontSizeMd,
      lg: Tokens.FontSizeLg,
      xl: Tokens.FontSizeXl,
      '2xl': Tokens.FontSize2xl,
    },
    weights: {
      regular: Number(Tokens.FontWeightRegular),
      medium: Number(Tokens.FontWeightMedium),
      semibold: Number(Tokens.FontWeightSemibold),
      bold: Number(Tokens.FontWeightBold),
    },
  },
  radii: {
    xs: '2px', // Not yet migrated to JSON
    sm: '4px',
    md: '8px',
    lg: '12px',
    pill: '999px',
  },
  spacing: {
    xxs: Tokens.SpacingXxs,
    xs: Tokens.SpacingXs,
    sm: Tokens.SpacingSm,
    md: Tokens.SpacingMd,
    lg: Tokens.SpacingLg,
    xl: Tokens.SpacingXl,
    '2xl': Tokens.Spacing2xl,
  },
  shadows: {
    xs: '0 1px 2px rgba(2, 8, 23, 0.06)', // Not yet migrated
    sm: '0 2px 4px rgba(2, 8, 23, 0.08)',
    md: '0 4px 8px rgba(2, 8, 23, 0.12)',
    lg: '0 10px 24px rgba(2, 8, 23, 0.18)',
    inset: 'inset 0 1px 2px rgba(2, 8, 23, 0.08)',
  },
};

export const tokens = defaultTheme;

export * from './generated/tokens';
