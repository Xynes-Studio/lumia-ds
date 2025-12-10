import type { ZodTypeAny } from 'zod';

/**
 * Extra form data provided to validators for cross-field checks.
 */
export type ValidationContext = Record<string, unknown>;

/**
 * Describes a Lumia-style inline validation rule.
 *
 * @template TValue - The value being validated (defaults to unknown).
 * @template TContext - Additional validation context (defaults to ValidationContext).
 */
export type ValidationRule<
  TValue = unknown,
  TContext extends ValidationContext = ValidationContext,
> = {
  name: string;
  message: string;
  validate: (value: TValue, ctx?: TContext) => boolean | Promise<boolean>;
};

const DEFAULT_MESSAGES = {
  required: 'This field is required.',
  minLength: (len: number) => `Must be at least ${len} characters.`,
  maxLength: (len: number) => `Must be at most ${len} characters.`,
  email: 'Enter a valid email address.',
  regex: 'Value does not match the required pattern.',
  zod: 'Invalid value.',
};

type ZodInput<T extends ZodTypeAny> = T['_input'];

const hasLength = (value: unknown): value is { length: number } =>
  value !== null &&
  value !== undefined &&
  typeof (value as { length?: unknown }).length === 'number';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+(?:\.[^\s@]+)?$/i;

export const required = <T = unknown>(
  message = DEFAULT_MESSAGES.required,
): ValidationRule<T> => ({
  name: 'required',
  message,
  validate: (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },
});

export const minLength = <T extends { length: number }>(
  len: number,
  message = DEFAULT_MESSAGES.minLength(len),
): ValidationRule<T> => ({
  name: 'minLength',
  message,
  validate: (value) => hasLength(value) && value.length >= len,
});

export const maxLength = <T extends { length: number }>(
  len: number,
  message = DEFAULT_MESSAGES.maxLength(len),
): ValidationRule<T> => ({
  name: 'maxLength',
  message,
  validate: (value) => hasLength(value) && value.length <= len,
});

export const email = (
  message = DEFAULT_MESSAGES.email,
): ValidationRule<string> => ({
  name: 'email',
  message,
  validate: (value) =>
    typeof value === 'string' && EMAIL_PATTERN.test(value.trim()),
});

export const regex = (
  pattern: RegExp,
  message = DEFAULT_MESSAGES.regex,
): ValidationRule<string> => ({
  name: 'regex',
  message,
  validate: (value) => {
    if (typeof value !== 'string') return false;
    pattern.lastIndex = 0;
    return pattern.test(value);
  },
});

export const zodRule = <TSchema extends ZodTypeAny>(
  schema: TSchema,
  message = DEFAULT_MESSAGES.zod,
): ValidationRule<ZodInput<TSchema>> => ({
  name: 'zod',
  message,
  validate: (value) => schema.safeParse(value).success,
});
