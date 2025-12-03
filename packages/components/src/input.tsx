import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  CSSProperties,
} from 'react';
import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import {
  baseFieldClasses,
  buildAriaDescribedBy,
  FieldProps,
  fieldWrapperClasses,
  hintClasses,
  invalidFieldClasses,
  invalidHintClasses,
} from './field';
import { cn } from './utils';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & FieldProps;

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> &
  FieldProps & {
    autoResize?: boolean;
    showCount?: boolean;
    maxLength?: number;
  };

const textareaAdditionalClasses = 'min-h-[120px] resize-y';
const defaultAutoResizeMaxHeight = 320;

const toCssSize = (value: CSSProperties['maxHeight']) => {
  if (typeof value === 'number') {
    return `${value}px`;
  }

  return value?.toString();
};

const parsePixelValue = (value: CSSProperties['maxHeight']) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.endsWith('px')) {
    return Number.parseFloat(value);
  }

  return null;
};

const getValueLength = (
  value: TextareaProps['value'] | TextareaProps['defaultValue'],
) => {
  if (value === null || value === undefined) return 0;
  if (Array.isArray(value)) return value.join(',').length;

  return String(value).length;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    hint,
    invalid = false,
    'aria-describedby': describedBy,
    ...props
  },
  ref,
) {
  const generatedHintId = useId();
  const hintId = hint ? generatedHintId : undefined;
  const ariaDescribedBy = buildAriaDescribedBy(describedBy, hintId);

  return (
    <div className={fieldWrapperClasses}>
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        aria-describedby={ariaDescribedBy}
        className={cn(
          baseFieldClasses,
          invalid && invalidFieldClasses,
          className,
        )}
        {...props}
      />
      {hint ? (
        <p
          id={hintId}
          className={cn(hintClasses, invalid && invalidHintClasses)}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      className,
      hint,
      invalid = false,
      autoResize = false,
      showCount = false,
      maxLength,
      style,
      'aria-describedby': describedBy,
      onChange,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const hintId = hint ? `${generatedId}-hint` : undefined;
    const shouldShowCount = showCount && typeof maxLength === 'number';
    const counterId = shouldShowCount ? `${generatedId}-counter` : undefined;
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const resolvedMaxHeight =
      style?.maxHeight ?? `${defaultAutoResizeMaxHeight}px`;
    const parsedMaxHeight = parsePixelValue(resolvedMaxHeight);
    const ariaDescribedBy = buildAriaDescribedBy(
      describedBy,
      hintId,
      counterId,
    );
    const [currentLength, setCurrentLength] = useState(() =>
      shouldShowCount ? getValueLength(props.value ?? props.defaultValue) : 0,
    );

    const setRefs = (node: HTMLTextAreaElement | null) => {
      textareaRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    const resizeTextarea = (element?: HTMLTextAreaElement | null) => {
      if (!autoResize) return;

      const target = element ?? textareaRef.current;
      if (!target) return;

      target.style.height = 'auto';
      target.style.maxHeight = toCssSize(resolvedMaxHeight) ?? '';

      const nextHeight = parsedMaxHeight
        ? Math.min(target.scrollHeight, parsedMaxHeight)
        : target.scrollHeight;

      target.style.height = `${nextHeight}px`;
    };

    useEffect(() => {
      resizeTextarea();
    }, [autoResize, resolvedMaxHeight, props.defaultValue, props.value]);

    useEffect(() => {
      if (!shouldShowCount) return;

      setCurrentLength(getValueLength(props.value ?? props.defaultValue));
    }, [props.defaultValue, props.value, shouldShowCount]);

    const handleChange: TextareaProps['onChange'] = (event) => {
      if (shouldShowCount) {
        setCurrentLength(event.currentTarget.value.length);
      }

      resizeTextarea(event.currentTarget);
      onChange?.(event);
    };

    const textareaStyle = autoResize
      ? { ...style, maxHeight: resolvedMaxHeight }
      : style;

    return (
      <div className={fieldWrapperClasses}>
        <textarea
          ref={setRefs}
          aria-invalid={invalid || undefined}
          aria-describedby={ariaDescribedBy}
          maxLength={maxLength}
          className={cn(
            baseFieldClasses,
            textareaAdditionalClasses,
            invalid && invalidFieldClasses,
            className,
          )}
          style={textareaStyle}
          onChange={handleChange}
          {...props}
        />
        {hint || shouldShowCount ? (
          <div className="flex items-start justify-between gap-2">
            {hint ? (
              <p
                id={hintId}
                className={cn(hintClasses, invalid && invalidHintClasses)}
              >
                {hint}
              </p>
            ) : (
              <span aria-hidden="true" className="flex-1" />
            )}
            {shouldShowCount ? (
              <span
                id={counterId}
                className={cn(
                  'text-xs leading-5 text-muted',
                  invalid && 'text-destructive',
                )}
              >
                {currentLength} / {maxLength}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  },
);
