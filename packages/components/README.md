# @lumia/components

Lumia React components (buttons, inputs, overlays, tabs, layout helpers) themed via `@lumia/theme` and `@lumia/tokens`.

## Install

```bash
pnpm add @lumia/components @lumia/theme @lumia/tokens
```

## Usage (sampler)

```tsx
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardSubtitle,
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
  FlatList,
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
        autoResize
        maxLength={240}
        showCount
        hint="Auto-resizes and shows a counter"
      />

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Billing overview</CardTitle>
          <CardSubtitle>Quick stats for this month</CardSubtitle>
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

      <Flex direction="col" gap="xs">
        <p className="text-sm font-medium text-foreground">Response time</p>
        <Radio name="sla" value="standard" label="Standard" defaultChecked />
        <Radio name="sla" value="priority" label="Priority" />
      </Flex>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <p className="text-sm text-muted-foreground ">
            High level summary content lives here.
          </p>
        </TabsContent>
        <TabsContent value="usage">
          <p className="text-sm text-muted-foreground ">
            Best practices, copy, and quick references.
          </p>
        </TabsContent>
        <TabsContent value="history">
          <p className="text-sm text-muted-foreground ">
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

      <Flex
        as="section"
        direction="row"
        align="center"
        justify="between"
        gap="sm"
      >
        <p className="text-sm text-muted-foreground ">Flex layout primitive</p>
        <Flex align="center" gap="xs">
          <span className="text-xs uppercase text-muted-foreground ">Direction</span>
          <code className="rounded bg-muted px-2 py-1 text-xs">row</code>
        </Flex>
      </Flex>

      <FlatList
        data={[
          { id: '1', name: 'Alpha' },
          { id: '2', name: 'Beta' },
          { id: '3', name: 'Gamma' },
        ]}
        estimatedItemSize={40}
        renderItem={({ item }) => (
          <div className="flex h-10 items-center px-3 text-sm">
            {item.name}
          </div>
        )}
        keyExtractor={(item) => item.id}
        scrollContainerProps={{ style: { height: 160 } }}
      />
    </Flex>
  );
}
```

### Textarea options

- `autoResize` automatically grows height until it hits the max height (defaults to `320px`, respects a custom `style.maxHeight`).
- `showCount` displays a `current / maxLength` counter beside the hint when `maxLength` is provided.
- Respects invalid state styling for both the field and counter text.

### Loading States
All interactive components (`Button`, `MenuItem`, `ConfirmDialog`, `Select`) support a standardized `isLoading` prop.
- **Button**: Replaces/augments content with a spinner; disables interaction.
- **MenuItem**: Replaces icon with spinner; disables selection.
- **Select**: Replaces chevron with spinner; disables selection.
- **ConfirmDialog**: Automatically handles async `onConfirm` loading state.

## Storybook

`HOME=$(pwd) STORYBOOK_DISABLE_TELEMETRY=1 pnpm --filter @lumia/components storybook -- -p 6006`

More details: see `docs/storybook.md`.

### Dialog notes

- Built on `@radix-ui/react-dialog` for focus trapping and accessible roles (`role="dialog"`, `aria-modal`, labelled by the title).
- Overlay and content pull design tokens for background, border, radius, and shadow; overlay click, ESC key, and the close button all dismiss and return focus to the trigger.
- Use `DialogTrigger` with `asChild` to wrap buttons/links, and compose `DialogHeader`, `DialogTitle`, `DialogDescription`, and `DialogFooter` for consistent spacing.

### Tabs notes

- Horizontal by default; pass `orientation="vertical"` to render the list in a column and keep panels aligned to the right.
- Keyboard arrows and Home/End follow WAI-ARIA: left/up/right/down (or up/down for vertical) move focus, Home/End jump to first/last enabled tab.
- Use `defaultValue` for uncontrolled use, or `value` + `onValueChange` for controlled tabs; disabled triggers are skipped when moving with the keyboard.

### Sheet notes

- Same Radix foundation as Dialog but positioned as a drawer from any edge (`side="right" | "left" | "top" | "bottom"`).
- Overlay uses DS overlay tokens; sheet width uses token-friendly constraints (`min(90vw, 26rem)` on sides, responsive widths on top/bottom).
- `closeOnOverlayClick` (default `true`) controls whether overlay click dismisses; ESC and the close button always close and return focus to the trigger.

### Flex notes

- Supports responsive layout props for `direction`, `align`, `justify`, `wrap`, and `gap` (e.g. `direction={{ base: 'col', md: 'row' }}`).
- Size helpers: `flex="1" | "auto" | "initial" | "none"`, `shrink={0 | 1}`, `inline` for `inline-flex`, `hiddenUntil="md"` to reveal at breakpoints.
- Prefer composing `Flex` over adding raw Tailwind `flex-*` classes so layout behaviour is centralized.

### FlatList notes

- React Native–style API: `data`, `renderItem`, optional `keyExtractor`, `onEndReached`, and `onViewableItemsChanged`.
- Virtualized rendering uses a relative container with absolutely positioned items sized by `estimatedItemSize` and optional `overscan`.
- `onEndReached` fires when scroll progress exceeds `onEndReachedThreshold` (default `0.8`), and viewability callback is triggered when the visible window changes.
- Pass `scrollContainerProps` for scroll height/attributes; only visible rows mount while total scroll height matches the estimated list size.

## Local development

- Build: `pnpm --filter @lumia/components build`
- Test (happy-dom): `pnpm --filter @lumia/components test`
