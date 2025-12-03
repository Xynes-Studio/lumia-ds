import type { ElementRef } from 'react';
import { forwardRef, useId } from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from './utils';

export type SwitchProps = Omit<
  SwitchPrimitive.SwitchProps,
  'checked' | 'defaultChecked' | 'onCheckedChange'
> & {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
};

const trackClasses =
  'inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-border bg-muted transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 data-[state=checked]:border-primary data-[state=checked]:bg-primary';

const thumbClasses =
  'pointer-events-none block h-5 w-5 rounded-full bg-background shadow transition-transform duration-200 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0';

export const Switch = forwardRef<
  ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(function Switch({ checked, onChange, label, id, className, ...props }, ref) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const isDisabled = props.disabled ?? false;

  const control = (
    <SwitchPrimitive.Root
      ref={ref}
      id={controlId}
      checked={checked}
      onCheckedChange={onChange}
      className={cn(trackClasses, className)}
      {...props}
    >
      <SwitchPrimitive.Thumb className={thumbClasses} />
    </SwitchPrimitive.Root>
  );

  if (!label) {
    return control;
  }

  return (
    <label
      htmlFor={controlId}
      className={cn(
        'inline-flex items-center gap-3 text-foreground',
        isDisabled && 'cursor-not-allowed opacity-70',
      )}
    >
      {control}
      <span className="select-none text-sm font-medium leading-5">{label}</span>
    </label>
  );
});
