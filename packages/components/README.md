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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  Flex,
} from '@lumia/components';

export function Example() {
  return (
    <Flex direction="col" gap="md">
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

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <p className="text-sm text-muted">
            High level summary content lives here.
          </p>
        </TabsContent>
        <TabsContent value="usage">
          <p className="text-sm text-muted">
            Best practices, copy, and quick references.
          </p>
        </TabsContent>
        <TabsContent value="history">
          <p className="text-sm text-muted">
            Changes or notes for this section.
          </p>
        </TabsContent>
      </Tabs>

      <Dialog>
        <DialogTrigger asChild>
          <Button>Open dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog title</DialogTitle>
            <DialogDescription>
              Explain what the user can do in this dialog.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-foreground/80">
            Body copy lives here. Press ESC or click outside to dismiss.
          </p>
      <DialogFooter>
        <Button variant="secondary">Cancel</Button>
        <Button>Confirm</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

      <Sheet>
        <SheetTrigger asChild>
          <Button>Open drawer</Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>
              Adjust list results without leaving the page.
            </SheetDescription>
          </SheetHeader>
          <p className="text-sm text-foreground/80">
            Add inputs or any custom layout inside the sheet body.
          </p>
          <SheetFooter>
            <Button variant="secondary">Reset</Button>
            <Button>Apply</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Flex as="section" direction="row" align="center" justify="between" gap="sm">
        <p className="text-sm text-muted">Flex layout primitive</p>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase text-muted">Direction</span>
          <code className="rounded bg-muted px-2 py-1 text-xs">row</code>
        </div>
      </Flex>
    </Flex>
  );
}
```

Storybook (Button playground):  
`HOME=$(pwd) STORYBOOK_DISABLE_TELEMETRY=1 pnpm --filter @lumia/components storybook -- -p 6006`

More details: see `docs/storybook.md`.

### Dialog notes

- Built on `@radix-ui/react-dialog` for focus trapping and accessible roles (`role="dialog"`, `aria-modal`, labelled by the title).
- Overlay and content pull design tokens for background, border, radius, and shadow; overlay click, ESC key, and the close button all dismiss and return focus to the trigger.
- Use `DialogTrigger` with `asChild` to wrap buttons/links, and compose `DialogHeader`, `DialogTitle`, `DialogDescription`, and `DialogFooter` for consistent spacing.

### Sheet notes

- Same Radix foundation as Dialog but positioned as a drawer from any edge (`side="right" | "left" | "top" | "bottom"`).
- Overlay uses DS overlay tokens; sheet width uses token-friendly constraints (`min(90vw, 26rem)` on sides, responsive widths on top/bottom).
- `closeOnOverlayClick` (default `true`) controls whether overlay click dismisses; ESC and the close button always close and return focus to the trigger.

## Local development

- Build: `pnpm --filter @lumia/components build`
- Test (happy-dom): `pnpm --filter @lumia/components test`
