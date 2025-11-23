/**
 * ThemeTokens mirrors the Figma token primitives. Naming adjustments:
 * - Figma "Surface" tokens map to `colors.background`
 * - Figma "Text" tokens map to `colors.foreground`
 * - Figma "Error" maps to `colors.destructive` to match component prop naming
 */
export type ThemeTokens = {
    colors: {
        primary: string;
        secondary: string;
        background: string;
        foreground: string;
        border: string;
        muted: string;
        destructive: string;
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

export const tokens: ThemeTokens = {
    colors: {
        primary: '#0070f3',
        secondary: '#8b5cf6',
        background: '#ffffff',
        foreground: '#0f172a',
        border: '#e2e8f0',
        muted: '#f1f5f9',
        destructive: '#ef4444',
    },
    typography: {
        families: {
            sans: '"Inter", "Helvetica Neue", Arial, sans-serif',
            mono: '"SFMono-Regular", "Menlo", "Monaco", Consolas, "Liberation Mono", "Courier New", monospace',
            display: '"Satoshi", "Inter", "Helvetica Neue", Arial, sans-serif',
        },
        sizes: {
            xs: '12px',
            sm: '14px',
            md: '16px',
            lg: '20px',
            xl: '24px',
            '2xl': '32px',
        },
        weights: {
            regular: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
        },
    },
    radii: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        pill: '999px',
    },
    spacing: {
        xxs: '4px',
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '40px',
    },
    shadows: {
        xs: '0 1px 2px rgba(15, 23, 42, 0.06)',
        sm: '0 2px 4px rgba(15, 23, 42, 0.08)',
        md: '0 4px 8px rgba(15, 23, 42, 0.12)',
        lg: '0 10px 24px rgba(15, 23, 42, 0.18)',
        inset: 'inset 0 1px 2px rgba(15, 23, 42, 0.08)',
    },
};
