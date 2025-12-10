# Card (DS-1105)

Structured surface for grouping related content with optional header and footer affordances.

## Exports
- `Card`, `CardHeader`, `CardTitle`, `CardSubtitle` (alias: `CardDescription`), `CardContent`, `CardFooter` from `@lumia-ui/components`.

## Header
- `icon?: ReactNode` — renders a left-aligned 40px container (muted background) for an icon or avatar.
- `actions?: ReactNode` — right-aligned slot for buttons/menus.
- Children typically include `CardTitle` and `CardSubtitle`.

## Footer
- `actions?: ReactNode` — right-aligned slot for primary/secondary buttons.
- Children area can hold secondary text or status.

## Spacing & layout
- Card shell: `rounded-lg`, border, subtle shadow, `overflow-hidden`.
- Sections use consistent `px-6 py-4`. Header/footer add subtle borders (`border-b` / `border-t`).
- Header content stacks with `gap` between title/subtitle; icon/actions align without breaking wrapping text.

## Usage
```tsx
import { Icon } from '@lumia-ui/icons';
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardSubtitle,
  CardTitle,
} from '@lumia-ui/components';

export function BillingCard() {
  return (
    <Card className="max-w-md">
      <CardHeader
        icon={<Icon id="sparkle" size={18} aria-hidden />}
        actions={
          <Button variant="ghost" size="sm">
            Manage
          </Button>
        }
      >
        <CardTitle>Billing overview</CardTitle>
        <CardSubtitle>Quick stats for this month</CardSubtitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground">
          Balance: <strong>$1,240.00</strong>
        </p>
      </CardContent>
      <CardFooter
        actions={
          <div className="flex gap-3">
            <Button variant="secondary" size="sm">
              Dismiss
            </Button>
            <Button size="sm">View details</Button>
          </div>
        }
      >
        <p className="text-sm leading-5 text-muted-foreground -foreground">Autopay runs on the 5th.</p>
      </CardFooter>
    </Card>
  );
}
```

## Notes
- `CardDescription` is maintained as an alias to `CardSubtitle` for backward compatibility.
- Use the header/footer `actions` slots instead of manual flex wrappers to keep spacing consistent with the system spec.
