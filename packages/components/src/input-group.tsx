import type { HTMLAttributes, InputHTMLAttributes } from 'react';
import { createContext, forwardRef, useContext } from 'react';
import { cn } from './utils';

type InputGroupContextValue = {
  disabled?: boolean;
  invalid?: boolean;
};

const InputGroupContext = createContext<InputGroupContextValue | null>(null);

const useInputGroupContext = () => useContext(InputGroupContext) ?? {};

const groupClasses =
  'flex w-full items-stretch overflow-hidden rounded-md border border-border bg-background text-sm text-foreground focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 ring-offset-background';
const invalidGroupClasses = 'border-destructive focus-within:ring-destructive';
const disabledGroupClasses = 'cursor-not-allowed opacity-50';

const inputClasses =
  'flex-1 min-w-0 border-0 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50';

const addonBaseClasses =
  'flex shrink-0 items-center gap-2 bg-muted/60 px-3 py-2 text-sm text-muted whitespace-nowrap';
const prefixClasses = 'border-r border-border';
const suffixClasses = 'border-l border-border';

export type InputGroupProps = HTMLAttributes<HTMLDivElement> & {
  invalid?: boolean;
  disabled?: boolean;
};

export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(
  function InputGroup(
    { children, className, invalid = false, disabled = false, ...props },
    ref,
  ) {
    const contextValue = { disabled, invalid };

    return (
      <InputGroupContext.Provider value={contextValue}>
        <div
          ref={ref}
          role="group"
          aria-disabled={disabled || undefined}
          className={cn(
            groupClasses,
            invalid && invalidGroupClasses,
            disabled && disabledGroupClasses,
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </InputGroupContext.Provider>
    );
  },
);

export type InputGroupInputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const InputGroupInput = forwardRef<
  HTMLInputElement,
  InputGroupInputProps
>(function InputGroupInput(
  { className, invalid, disabled, 'aria-invalid': ariaInvalid, ...props },
  ref,
) {
  const context = useInputGroupContext();
  const resolvedDisabled = disabled ?? context.disabled ?? false;
  const resolvedInvalid = invalid ?? context.invalid ?? false;

  return (
    <input
      ref={ref}
      aria-invalid={ariaInvalid ?? (resolvedInvalid || undefined)}
      disabled={resolvedDisabled}
      className={cn(inputClasses, className)}
      {...props}
    />
  );
});

export type InputGroupAddonProps = HTMLAttributes<HTMLDivElement>;

export const InputGroupPrefix = forwardRef<
  HTMLDivElement,
  InputGroupAddonProps
>(function InputGroupPrefix({ className, ...props }, ref) {
  const { disabled } = useInputGroupContext();

  return (
    <div
      ref={ref}
      aria-disabled={disabled || undefined}
      className={cn(addonBaseClasses, prefixClasses, className)}
      {...props}
    />
  );
});

export const InputGroupSuffix = forwardRef<
  HTMLDivElement,
  InputGroupAddonProps
>(function InputGroupSuffix({ className, ...props }, ref) {
  const { disabled } = useInputGroupContext();

  return (
    <div
      ref={ref}
      aria-disabled={disabled || undefined}
      className={cn(addonBaseClasses, suffixClasses, className)}
      {...props}
    />
  );
});
