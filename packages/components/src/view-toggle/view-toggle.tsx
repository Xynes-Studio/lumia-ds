import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  KeyboardEvent,
} from 'react';
import { forwardRef, useCallback } from 'react';
import { Icon } from '@lumia/icons';
import { cn } from '../lib/utils';

export type ViewMode = 'grid' | 'list';

export type ViewToggleProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange'
> & {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  buttonProps?: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>;
};

const groupClasses =
  'inline-flex items-center gap-1 rounded-lg border border-border bg-muted/60 p-1 shadow-sm';

const buttonClasses =
  'inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground  transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ring-offset-background hover:text-foreground hover:bg-background data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm disabled:cursor-not-allowed disabled:opacity-50';

const viewOptions: { mode: ViewMode; label: string; icon: string }[] = [
  { mode: 'grid', label: 'Grid view', icon: 'layout-grid' },
  { mode: 'list', label: 'List view', icon: 'list' },
];

export const ViewToggle = forwardRef<HTMLDivElement, ViewToggleProps>(
  function ViewToggle(
    {
      className,
      mode,
      onChange,
      buttonProps,
      'aria-label': ariaLabel,
      ...props
    },
    ref,
  ) {
    const handleKeyDown = useCallback(
      (
        event: KeyboardEvent<HTMLButtonElement>,
        targetMode: ViewMode,
        userHandler?: ButtonHTMLAttributes<HTMLButtonElement>['onKeyDown'],
      ) => {
        userHandler?.(event);
        if (event.defaultPrevented) return;
        if (
          event.key === 'Enter' ||
          event.key === ' ' ||
          event.key === 'Spacebar'
        ) {
          event.preventDefault();
          onChange(targetMode);
        }
      },
      [onChange],
    );

    return (
      <div
        {...props}
        ref={ref}
        role="group"
        aria-label={ariaLabel ?? 'Toggle view mode'}
        className={cn(groupClasses, className)}
      >
        {viewOptions.map((option) => {
          const isActive = option.mode === mode;
          const {
            className: optionClassName,
            onKeyDown,
            ...restButtonProps
          } = buttonProps ?? {};

          return (
            <button
              key={option.mode}
              type="button"
              aria-label={option.label}
              aria-pressed={isActive}
              data-state={isActive ? 'active' : 'inactive'}
              className={cn(buttonClasses, optionClassName)}
              onClick={() => onChange(option.mode)}
              onKeyDown={(event) =>
                handleKeyDown(event, option.mode, onKeyDown)
              }
              {...restButtonProps}
            >
              <Icon
                name={option.icon}
                size={18}
                aria-hidden="true"
                className="shrink-0"
              />
            </button>
          );
        })}
      </div>
    );
  },
);

export const viewToggleStyles = {
  group: groupClasses,
  button: buttonClasses,
};
