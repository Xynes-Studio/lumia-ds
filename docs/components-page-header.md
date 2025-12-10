# PageHeader (@lumia-ui/components)

Composable page or section header that pairs breadcrumbs, a title stack, and primary/secondary actions. Built on the `Breadcrumbs` and `Toolbar` primitives so it can sit at the top of a full page or inside a `Card`.

## Import
```ts
import {
  PageHeader,
  type PageHeaderProps,
  type BreadcrumbItem,
  Button,
} from '@lumia-ui/components';
```

## Props
- `title: string` — required heading text.
- `subtitle?: string` — optional supporting line below the title.
- `breadcrumbs?: BreadcrumbItem[]` — passed straight to `Breadcrumbs`; omitted when empty.
- `primaryAction?: React.ReactNode` — right-aligned primary control (usually a button).
- `secondaryActions?: React.ReactNode | React.ReactNode[]` — secondary controls that render before the primary action.
- `className?: string` and native `HTMLAttributes<HTMLElement>` pass through to the header wrapper.

## Usage
```tsx
const crumbs: BreadcrumbItem[] = [
  { label: 'Home', href: '#home' },
  { label: 'Projects', href: '#projects' },
  { label: 'Lumia DS' },
];

<PageHeader
  title="Projects"
  subtitle="Manage workstreams, collaborators, and reviews."
  breadcrumbs={crumbs}
  secondaryActions={
    <Button variant="ghost" size="sm">
      Share
    </Button>
  }
  primaryAction={<Button size="sm">New project</Button>}
/>
```

### Inside a Card
```tsx
<Card>
  <PageHeader
    className="px-6 pt-4" // optional padding helpers when nesting
    title="Account overview"
    subtitle="Key health metrics"
    breadcrumbs={[
      { label: 'Accounts', href: '#accounts' },
      { label: 'Acme Corp' },
    ]}
    primaryAction={<Button size="sm">Edit</Button>}
  />
  <CardContent>{/* card body */}</CardContent>
</Card>
```

## Notes
- Breadcrumbs collapse automatically when `maxItems` is set on `Breadcrumbs` props; pass the array only when you need them.
- Actions live in the `Toolbar` right slot. Omit `primaryAction`/`secondaryActions` to render only the title stack.
- Titles truncate when space is tight; use `subtitle` for supporting context instead of overlong headings.
