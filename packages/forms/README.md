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
