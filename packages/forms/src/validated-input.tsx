import type { ChangeEvent, FocusEvent } from 'react';
import { forwardRef, useCallback, useRef, useState } from 'react';
import type { InputProps } from '@lumia/components';
import { Input } from '@lumia/components';
import type { ValidationRule } from './validation';

type ValidatedInputProps = {
  value: string;
  onChange: (value: string) => void;
  rules?: ValidationRule<string>[];
  hint?: string;
} & Omit<InputProps, 'value' | 'onChange' | 'invalid' | 'hint'>;

export const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(
  function ValidatedInput(
    { value, onChange, rules = [], hint, onBlur, ...inputProps },
    ref,
  ) {
    const [error, setError] = useState<string | null>(null);
    const validationRun = useRef(0);

    const runValidation = useCallback(
      async (nextValue: string) => {
        const runId = ++validationRun.current;

        if (!rules.length) {
          setError(null);
          return;
        }

        for (const rule of rules) {
          const result = rule.validate(nextValue);
          const isValid = typeof result === 'boolean' ? result : await result;

          if (!isValid) {
            if (validationRun.current === runId) {
              setError(rule.message);
            }
            return;
          }
        }

        if (validationRun.current === runId) {
          setError(null);
        }
      },
      [rules],
    );

    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        const nextValue = event.target.value;
        onChange(nextValue);
        void runValidation(nextValue);
      },
      [onChange, runValidation],
    );

    const handleBlur = useCallback(
      (event: FocusEvent<HTMLInputElement>) => {
        onBlur?.(event);
        const nextValue = event.currentTarget.value;
        void runValidation(nextValue);
      },
      [onBlur, runValidation],
    );

    const displayHint = error ?? hint;
    const isInvalid = Boolean(error);

    return (
      <Input
        {...inputProps}
        ref={ref}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        hint={displayHint}
        invalid={isInvalid}
      />
    );
  },
);
