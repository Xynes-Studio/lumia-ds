export type FieldProps = {
  invalid?: boolean;
  hint?: string;
};

export const fieldWrapperClasses = 'flex flex-col gap-1.5';

export const baseFieldClasses =
  'flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ring-offset-background disabled:cursor-not-allowed disabled:opacity-50';

export const invalidFieldClasses =
  'border-destructive focus-visible:ring-destructive';

export const hintClasses = 'text-sm leading-5 text-muted';
export const invalidHintClasses = 'text-destructive';

export const buildAriaDescribedBy = (
  describedBy?: string | null,
  hintId?: string,
) => [describedBy, hintId].filter(Boolean).join(' ') || undefined;
