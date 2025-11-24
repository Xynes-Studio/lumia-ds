import { describe, expect, expectTypeOf, it } from 'vitest';
import type { ValidationContext, ValidationRule } from './index';

describe('@lumia/forms', () => {
  it('supports synchronous validation', async () => {
    const required: ValidationRule<string> = {
      name: 'required',
      message: 'Value is required',
      validate: (value) => value.trim().length > 0,
    };

    expect(await required.validate('hello')).toBe(true);
    expect(await required.validate('')).toBe(false);
  });

  it('supports async validation with context', async () => {
    type EmailContext = ValidationContext & { blockedDomains: string[] };

    const emailNotBlocked: ValidationRule<string, EmailContext> = {
      name: 'email-not-blocked',
      message: 'Domain is blocked',
      validate: async (value, ctx) => {
        if (!ctx) return true;
        const domain = value.split('@')[1];
        return domain ? !ctx.blockedDomains.includes(domain) : false;
      },
    };

    const ctx: EmailContext = { blockedDomains: ['example.com'] };
    expect(await emailNotBlocked.validate('user@lumia.dev', ctx)).toBe(true);
    expect(await emailNotBlocked.validate('user@example.com', ctx)).toBe(false);
  });

  it('exposes value and context generics on validate', () => {
    type Ctx = { min: number };
    const rule: ValidationRule<number, Ctx> = {
      name: 'min',
      message: 'Too small',
      validate: (value, ctx) => value >= (ctx?.min ?? 0),
    };

    expectTypeOf(rule.validate).parameter(0).toEqualTypeOf<number>();
    expectTypeOf(rule.validate).parameter(1).toEqualTypeOf<Ctx | undefined>();
    expectTypeOf(rule.validate).returns.toMatchTypeOf<
      Promise<boolean> | boolean
    >();
  });
});
