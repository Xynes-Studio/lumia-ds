import type { ComponentPropsWithoutRef, ElementRef } from 'react';
import { forwardRef } from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '../lib/utils';

export type SliderProps = Omit<
  ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
  'value' | 'defaultValue' | 'onValueChange'
> & {
  value: number;
  min: number;
  max: number;
  step?: number;
  showValue?: boolean;
  onChange: (value: number) => void;
};

const trackClasses =
  'relative h-2 w-full grow overflow-hidden rounded-full bg-muted data-[disabled]:opacity-50';

const rangeClasses = 'absolute h-full bg-primary';

const thumbClasses =
  'block h-5 w-5 rounded-full border-2 border-primary bg-background shadow transition-[box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[state=active]:scale-[1.02] data-[disabled]:pointer-events-none data-[disabled]:opacity-60';

export const Slider = forwardRef<
  ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(function Slider(
  {
    value,
    min,
    max,
    step = 1,
    showValue = false,
    onChange,
    className,
    ...props
  },
  ref,
) {
  const isDisabled = props.disabled ?? false;

  const handleChange = (next: number[]) => {
    if (typeof next[0] === 'number') {
      onChange(next[0]);
    }
  };

  const control = (
    <SliderPrimitive.Root
      ref={ref}
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={handleChange}
      className={cn(
        'relative flex w-full select-none items-center touch-none',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className={trackClasses}>
        <SliderPrimitive.Range className={rangeClasses} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        aria-disabled={isDisabled || undefined}
        className={thumbClasses}
      />
    </SliderPrimitive.Root>
  );

  if (!showValue) {
    return control;
  }

  return (
    <div className="flex items-center gap-3">
      {control}
      <span className="min-w-[3ch] text-sm font-medium text-foreground tabular-nums">
        {value}
      </span>
    </div>
  );
});
