# @lumia/forms

Type definitions for Lumia-style inline validation.

## ValidationRule

```ts
import type { ValidationRule, ValidationContext } from '@lumia/forms';

type EmailCtx = ValidationContext & { blockedDomains: string[] };

export const emailNotBlocked: ValidationRule<string, EmailCtx> = {
    name: 'email-not-blocked',
    message: 'Domain is blocked',
    validate: async (value, ctx) => {
        const domain = value.split('@')[1];
        return domain ? !ctx?.blockedDomains.includes(domain) : false;
    },
};
```

- `name`: unique identifier for the rule.
- `message`: user-facing error text.
- `validate(value, ctx?)`: returns `boolean | Promise<boolean>`; `ctx` carries cross-field data.

## Built-in validation helpers

```ts
import {
    required,
    minLength,
    maxLength,
    email,
    regex,
    zodRule,
} from '@lumia/forms';
import { z } from 'zod';

// All helpers accept an optional custom message
const mustHaveName = required();
const atLeast3Chars = minLength(3);
const upTo10Chars = maxLength(10);
const mustBeEmail = email();
const postalCodePattern = regex(/^[A-Z]{3}\\d{2}$/);
const mustMatchSchema = zodRule(z.object({ name: z.string().min(1) }));
```

- `required(message?)`: fails for `null`, `undefined`, trimmed empty strings, or empty arrays.
- `minLength(len, message?)`: passes when `value.length >= len`.
- `maxLength(len, message?)`: passes when `value.length <= len`.
- `email(message?)`: basic email format check.
- `regex(pattern, message?)`: runs `pattern.test` on string values (stateful regexes are reset per call).
- `zodRule(schema, message?)`: uses `schema.safeParse(value)`; returns `false` when parsing fails and reports the provided message or `"Invalid value."` by default.
