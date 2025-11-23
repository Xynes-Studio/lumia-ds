# @lumia/components

Lumia design-system React components, wrapping shadcn primitives and themed via `@lumia/theme` and `@lumia/tokens`.

## Usage

```tsx
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Radio,
  Select,
  Textarea,
} from '@lumia/components';

export function Example() {
  return (
    <div className="flex flex-col gap-4">
      <Button variant="primary" size="md">
        Click
      </Button>

      <Select label="Role" defaultValue="">
        <option value="">Select a role</option>
        <option value="designer">Designer</option>
        <option value="engineer">Engineer</option>
      </Select>

      <Input placeholder="Your name" hint="This will be visible to admins" />

      <Textarea
        placeholder="Describe the issue"
        invalid
        hint="Please add more detail"
      />

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Billing overview</CardTitle>
          <CardDescription>Quick stats for this month</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground">
            Balance: <strong>$1,240.00</strong>
          </p>
        </CardContent>
        <CardFooter>
          <Button size="sm">View statement</Button>
        </CardFooter>
      </Card>

      <Checkbox label="Subscribe to updates" hint="Get release news via email" />

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">Response time</p>
        <Radio name="sla" value="standard" label="Standard" defaultChecked />
        <Radio name="sla" value="priority" label="Priority" />
      </div>
    </div>
  );
}
```

Storybook (Button playground):  
`HOME=$(pwd) STORYBOOK_DISABLE_TELEMETRY=1 pnpm --filter @lumia/components storybook -- -p 6006`

More details: see `docs/storybook.md`.

## Local development

- Build: `pnpm --filter @lumia/components build`
- Test (happy-dom): `pnpm --filter @lumia/components test`
