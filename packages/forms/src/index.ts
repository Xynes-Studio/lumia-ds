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
