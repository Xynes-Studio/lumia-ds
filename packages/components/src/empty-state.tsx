import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { Icon, type IconId } from '@lumia/icons';
import { Button, buttonStyles } from './button';
import { cn } from './utils';

export type EmptyStateAction = {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: IconId;
};

type StateVariant = 'empty' | 'noResults';

type StateLayout = {
  container: string;
  content: string;
  title: string;
  description: string;
  hint: string;
  actions: string;
  iconSize: number;
  iconWrapper: string;
  actionSize: keyof typeof buttonStyles.sizes;
};

const layouts: Record<StateVariant, StateLayout> = {
  empty: {
    container:
      'flex w-full flex-col items-center justify-center gap-4 px-6 py-12 text-center',
    content: 'flex max-w-prose flex-col items-center gap-2',
    title: 'text-xl font-semibold leading-7 tracking-tight text-foreground',
    description: 'text-sm leading-6 text-muted',
    hint: 'text-xs leading-6 text-muted',
    actions: 'mt-2 flex flex-wrap items-center justify-center gap-3',
    iconSize: 32,
    iconWrapper:
      'flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600',
    actionSize: 'md',
  },
  noResults: {
    container:
      'flex w-full items-start gap-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/40 px-4 py-5 text-left sm:gap-4 sm:px-5 sm:py-6',
    content: 'flex min-w-0 flex-col gap-1 text-left',
    title: 'text-base font-semibold leading-6 text-foreground',
    description: 'text-sm leading-6 text-muted',
    hint: 'text-xs leading-5 text-muted-foreground',
    actions: 'mt-2 flex flex-wrap items-center gap-2',
    iconSize: 20,
    iconWrapper:
      'flex h-10 w-10 items-center justify-center rounded-full bg-background text-muted-foreground ring-1 ring-inset ring-muted-foreground/20',
    actionSize: 'sm',
  },
};

type StateProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  description?: string;
  icon?: IconId;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  hint?: string;
  variant: StateVariant;
};

export type EmptyStateProps = Omit<StateProps, 'variant' | 'hint'>;

const actionClassName = (
  variant: 'primary' | 'outline',
  size: keyof typeof buttonStyles.sizes,
) =>
  cn(
    buttonStyles.base,
    buttonStyles.variants[variant],
    buttonStyles.sizes[size],
    'inline-flex',
  );

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState(props, ref) {
    return <StateShell {...props} ref={ref} variant="empty" />;
  },
);

export type NoResultsProps = Omit<StateProps, 'variant' | 'hint' | 'title'> & {
  title?: string;
  resetHint?: string | null;
};

export const NoResults = forwardRef<HTMLDivElement, NoResultsProps>(
  function NoResults(
    {
      title = 'No results found',
      description = 'No results match your filters or search.',
      icon = 'search',
      resetHint,
      ...props
    },
    ref,
  ) {
    const hint =
      resetHint === null
        ? undefined
        : (resetHint ?? 'Reset filters or clear the search to see everything.');

    return (
      <StateShell
        {...props}
        ref={ref}
        title={title}
        description={description}
        icon={icon}
        variant="noResults"
        hint={hint}
      />
    );
  },
);

const StateShell = forwardRef<HTMLDivElement, StateProps>(function StateShell(
  {
    title,
    description,
    icon,
    primaryAction,
    secondaryAction,
    hint,
    variant,
    className,
    ...props
  },
  ref,
) {
  const {
    container,
    content,
    title: titleClass,
    description: descriptionClass,
    hint: hintClass,
    actions,
    iconSize,
    iconWrapper,
    actionSize,
  } = layouts[variant];

  return (
    <div ref={ref} className={cn(container, className)} {...props}>
      {icon ? (
        <div className={iconWrapper}>
          <Icon id={icon} size={iconSize} aria-hidden="true" />
        </div>
      ) : null}

      <div className={content}>
        <h3 className={titleClass}>{title}</h3>
        {description ? <p className={descriptionClass}>{description}</p> : null}
        {hint ? <p className={hintClass}>{hint}</p> : null}

        {primaryAction || secondaryAction ? (
          <div className={actions}>
            {primaryAction ? (
              <ActionButton
                action={primaryAction}
                variant="primary"
                size={actionSize}
              />
            ) : null}
            {secondaryAction ? (
              <ActionButton
                action={secondaryAction}
                variant="outline"
                size={actionSize}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
});

type ActionButtonProps = {
  action: EmptyStateAction;
  variant: 'primary' | 'outline';
  size: keyof typeof buttonStyles.sizes;
};

const ActionButton = ({ action, variant, size }: ActionButtonProps) => {
  const content = (
    <>
      {action.icon ? (
        <Icon id={action.icon} size={16} className="shrink-0" />
      ) : null}
      <span>{action.label}</span>
    </>
  );

  if (action.href) {
    return (
      <a
        href={action.href}
        onClick={action.onClick}
        className={actionClassName(variant, size)}
      >
        {content}
      </a>
    );
  }

  return (
    <Button
      variant={variant === 'primary' ? 'primary' : 'outline'}
      size={size}
      onClick={action.onClick}
    >
      {content}
    </Button>
  );
};
