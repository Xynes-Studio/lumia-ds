import { defaultTheme, themeToCSSVars } from '@lumia/tokens';

const PRIMARY_SCALE_STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
type PrimaryScaleStop = (typeof PRIMARY_SCALE_STOPS)[number];

const withFallback = (variableName: string, fallback: string) => `var(${variableName}, ${fallback})`;

const defaultCssVars = themeToCSSVars(defaultTheme);

const createPrimaryScale = () =>
    PRIMARY_SCALE_STOPS.reduce<Record<PrimaryScaleStop, string>>((scale, stop) => {
        scale[stop] = withFallback(
            `--color-primary-${stop}`,
            defaultCssVars[`--color-primary-${stop}`],
        );
        return scale;
    }, {} as Record<PrimaryScaleStop, string>);

const buildTailwindPreset = () => {
    const primaryScale = createPrimaryScale();

    return {
        theme: {
            extend: {
                colors: {
                    primary: {
                        ...primaryScale,
                        DEFAULT: withFallback('--color-primary', defaultCssVars['--color-primary']),
                    },
                    secondary: withFallback('--color-secondary', defaultCssVars['--color-secondary']),
                    background: withFallback('--color-bg', defaultCssVars['--color-bg']),
                    foreground: withFallback('--color-fg', defaultCssVars['--color-fg']),
                    border: withFallback('--color-border', defaultCssVars['--color-border']),
                    muted: withFallback('--color-muted', defaultCssVars['--color-muted']),
                    destructive: withFallback(
                        '--color-destructive',
                        defaultCssVars['--color-destructive'],
                    ),
                },
                borderRadius: {
                    DEFAULT: withFallback('--radius-md', defaultTheme.radii.md),
                    xs: withFallback('--radius-xs', defaultTheme.radii.xs),
                    sm: withFallback('--radius-sm', defaultTheme.radii.sm),
                    md: withFallback('--radius-md', defaultTheme.radii.md),
                    lg: withFallback('--radius-lg', defaultTheme.radii.lg),
                    pill: withFallback('--radius-pill', defaultTheme.radii.pill),
                    full: withFallback('--radius-pill', defaultTheme.radii.pill),
                },
                fontFamily: {
                    sans: [withFallback('--font-sans', defaultTheme.typography.families.sans)],
                    mono: [withFallback('--font-mono', defaultTheme.typography.families.mono)],
                    display: [
                        withFallback('--font-display', defaultTheme.typography.families.display),
                    ],
                },
            },
        },
    };
};

export type LumiaTailwindPreset = ReturnType<typeof buildTailwindPreset>;

export const lumiaTailwindPreset: LumiaTailwindPreset = buildTailwindPreset();

export const createLumiaTailwindConfig = (): LumiaTailwindPreset => buildTailwindPreset();
