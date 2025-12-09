import { describe, expect, expectTypeOf, it } from 'vitest';
import { z } from 'zod';
import {
  email,
  maxLength,
  minLength,
  regex,
  required,
  useForm,
  zodRule,
} from './index';
import type {
  SubmitHandler,
  UseFormReturn,
  ValidationContext,
  ValidationRule,
} from './index';
import type {
  SubmitHandler as RhfSubmitHandler,
  UseFormReturn as RhfUseFormReturn,
} from 'react-hook-form';

describe('@lumia-ui/forms', () => {
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

  it('re-exports react-hook-form helpers and types', () => {
    type Values = { title: string };

    expectTypeOf<SubmitHandler<Values>>().toEqualTypeOf<
      RhfSubmitHandler<Values>
    >();
    expectTypeOf<UseFormReturn<Values>>().toEqualTypeOf<
      RhfUseFormReturn<Values>
    >();
    expectTypeOf(useForm<Values>).returns.toMatchTypeOf<
      RhfUseFormReturn<Values>
    >();
  });

  describe('required', () => {
    it('passes when value is present and fails when empty', () => {
      const rule = required();
      expect(rule.message).toBe('This field is required.');
      expect(rule.validate('hello')).toBe(true);
      expect(rule.validate('   ')).toBe(false);
      expect(rule.validate([1])).toBe(true);
      expect(rule.validate([])).toBe(false);
      expect(rule.validate(0 as unknown as string)).toBe(true);
      expect(rule.validate(null as unknown as string)).toBe(false);
      expect(rule.validate(undefined as unknown as string)).toBe(false);
    });

    it('uses a custom message when provided', () => {
      const rule = required('Custom required message');
      expect(rule.message).toBe('Custom required message');
    });
  });

  describe('minLength', () => {
    it('validates length boundaries', () => {
      const rule = minLength(3);
      expect(rule.message).toBe('Must be at least 3 characters.');
      expect(rule.validate('hey')).toBe(true);
      expect(rule.validate('hi')).toBe(false);
      expect(rule.validate(['a', 'b', 'c'])).toBe(true);
      expect(rule.validate(['a'])).toBe(false);
      expect(rule.validate(null as unknown as string)).toBe(false);
    });
  });

  describe('maxLength', () => {
    it('validates upper length boundaries', () => {
      const rule = maxLength(5);
      expect(rule.message).toBe('Must be at most 5 characters.');
      expect(rule.validate('hello')).toBe(true);
      expect(rule.validate('welcome')).toBe(false);
      expect(rule.validate([1, 2, 3])).toBe(true);
      expect(rule.validate([1, 2, 3, 4, 5, 6])).toBe(false);
    });
  });

  describe('email', () => {
    it('accepts valid emails and rejects invalid ones', () => {
      const rule = email();
      expect(rule.message).toBe('Enter a valid email address.');
      expect(rule.validate('user@example.com')).toBe(true);
      expect(rule.validate(' user@example.com ')).toBe(true);
      expect(rule.validate('user@sub.example.co.uk')).toBe(true);
      expect(rule.validate('invalid-email')).toBe(false);
      expect(rule.validate('user@')).toBe(false);
      expect(rule.validate('user@domain')).toBe(false);
      expect(rule.validate(123 as unknown as string)).toBe(false);
    });
  });

  describe('regex', () => {
    it('validates strings against a regex pattern', () => {
      const rule = regex(/^[A-Z]{3}\d{2}$/);
      expect(rule.message).toBe('Value does not match the required pattern.');
      expect(rule.validate('ABC12')).toBe(true);
      expect(rule.validate('abc12')).toBe(false);
      expect(rule.validate('AB12')).toBe(false);
    });

    it('resets stateful regex instances and supports custom messages', () => {
      const pattern = /foo/g;
      const rule = regex(pattern, 'Must match foo');
      expect(rule.message).toBe('Must match foo');
      expect(rule.validate('foo')).toBe(true);
      expect(rule.validate('foo foo')).toBe(true);
      expect(rule.validate('bar')).toBe(false);
    });
  });

  describe('zodRule', () => {
    it('passes when schema validation succeeds and uses default message', () => {
      const rule = zodRule(z.string().min(3));
      expect(rule.message).toBe('Invalid value.');
      expect(rule.validate('hello')).toBe(true);
    });

    it('fails when schema validation fails and respects custom message', () => {
      const rule = zodRule(z.number().positive(), 'Value must be positive');
      expect(rule.message).toBe('Value must be positive');
      expect(rule.validate(-1)).toBe(false);
      expect(rule.validate(10)).toBe(true);
    });
  });
});
