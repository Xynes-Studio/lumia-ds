import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  KeyboardEvent,
  FocusEvent,
} from 'react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Icon, type IconId } from '@lumia/icons';
import { cn } from './utils';

export type SegmentedControlOption = {
  value: string;
  label: string;
  icon?: IconId;
};

export type SegmentedControlProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange'
> & {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  buttonProps?: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>;
};

const containerClasses =
  'inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 p-1 text-sm';

const optionClasses =
  'inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-medium text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ring-offset-background hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm disabled:cursor-not-allowed disabled:opacity-60';

export const SegmentedControl = forwardRef<
  HTMLDivElement,
  SegmentedControlProps
>(function SegmentedControl(
  { className, options, value, onChange, buttonProps, ...props },
  ref,
) {
  const buttonRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());
  const orderedValues = useMemo(
    () => options.map((option) => option.value),
    [options],
  );

  const [focusedValue, setFocusedValue] = useState<string | undefined>(() => {
    if (orderedValues.includes(value)) return value;
    return orderedValues[0];
  });

  useEffect(() => {
    if (orderedValues.includes(value)) {
      setFocusedValue((current) =>
        current && orderedValues.includes(current) ? current : value,
      );
    } else if (orderedValues.length > 0) {
      setFocusedValue(orderedValues[0]);
    } else {
      setFocusedValue(undefined);
    }
  }, [orderedValues, value]);

  const focusValue = useCallback(
    (target: string | undefined) => {
      if (!target) return;
      setFocusedValue(target);
      const node = buttonRefs.current.get(target);
      node?.focus();
    },
    [setFocusedValue],
  );

  const focusByStep = useCallback(
    (direction: 1 | -1) => {
      if (orderedValues.length === 0) return;
      const current =
        focusedValue && orderedValues.includes(focusedValue)
          ? focusedValue
          : orderedValues.includes(value)
            ? value
            : orderedValues[0];
      const startIndex = orderedValues.indexOf(current);
      const nextIndex =
        (startIndex + direction + orderedValues.length) % orderedValues.length;
      focusValue(orderedValues[nextIndex]);
    },
    [focusValue, focusedValue, orderedValues, value],
  );

  const focusEdge = useCallback(
    (edge: 'first' | 'last') => {
      if (orderedValues.length === 0) return;
      const target =
        edge === 'first'
          ? orderedValues[0]
          : orderedValues[orderedValues.length - 1];
      focusValue(target);
    },
    [focusValue, orderedValues],
  );

  const handleKeyDown = useCallback(
    (
      event: KeyboardEvent<HTMLButtonElement>,
      optionValue: string,
      userHandler?: ButtonHTMLAttributes<HTMLButtonElement>['onKeyDown'],
    ) => {
      userHandler?.(event);
      if (event.defaultPrevented) return;
      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          focusByStep(1);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          focusByStep(-1);
          break;
        case 'Home':
          event.preventDefault();
          focusEdge('first');
          break;
        case 'End':
          event.preventDefault();
          focusEdge('last');
          break;
        case 'Enter':
        case ' ':
        case 'Spacebar':
          event.preventDefault();
          onChange(optionValue);
          break;
        default:
          break;
      }
    },
    [focusByStep, focusEdge, onChange],
  );

  const handleFocus = useCallback(
    (
      event: FocusEvent<HTMLButtonElement>,
      optionValue: string,
      userHandler?: ButtonHTMLAttributes<HTMLButtonElement>['onFocus'],
    ) => {
      userHandler?.(event);
      if (event.defaultPrevented) return;
      setFocusedValue(optionValue);
    },
    [],
  );

  return (
    <div
      {...props}
      ref={ref}
      role="radiogroup"
      className={cn(containerClasses, className)}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        const isFocused =
          focusedValue === option.value ||
          (!focusedValue && option.value === value);
        const {
          className: optionClassName,
          onKeyDown: userKeyDown,
          onFocus: userFocus,
          ...restButtonProps
        } = buttonProps ?? {};

        return (
          <button
            key={option.value}
            ref={(node) => buttonRefs.current.set(option.value, node)}
            type="button"
            role="radio"
            aria-checked={isActive}
            tabIndex={isFocused ? 0 : -1}
            data-state={isActive ? 'active' : 'inactive'}
            className={cn(optionClasses, optionClassName)}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) =>
              handleKeyDown(event, option.value, userKeyDown)
            }
            onFocus={(event) => handleFocus(event, option.value, userFocus)}
            {...restButtonProps}
          >
            {option.icon ? (
              <Icon
                id={option.icon}
                size={16}
                aria-hidden="true"
                className="shrink-0"
              />
            ) : null}
            <span className="whitespace-nowrap">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
});
