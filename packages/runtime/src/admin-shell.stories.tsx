/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { AdminShell } from '@lumia/layout';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Flex,
} from '@lumia/components';

const meta = {
  title: 'Runtime/AdminShell',
  component: AdminShell,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AdminShell>;

export default meta;
type Story = StoryObj<typeof AdminShell>;

const Sidebar = () => (
  <nav className="flex flex-col gap-3 text-sm">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground ">
        Navigation
      </p>
      <div className="mt-2 flex flex-col gap-1 text-foreground">
        <button className="rounded-md px-2 py-1 text-left transition hover:bg-muted/60">
          Overview
        </button>
        <button className="rounded-md px-2 py-1 text-left transition hover:bg-muted/60">
          Projects
        </button>
        <button className="rounded-md px-2 py-1 text-left transition hover:bg-muted/60">
          Teams
        </button>
        <button className="rounded-md px-2 py-1 text-left transition hover:bg-muted/60">
          Settings
        </button>
      </div>
    </div>

    <div className="rounded-lg border border-border/70 bg-background/80 p-3 text-xs text-muted-foreground ">
      <p className="font-semibold text-foreground">Tip</p>
      <p>Sidebar and header are simple slots—drop in your own nav here.</p>
    </div>
  </nav>
);

const Header = () => (
  <div className="flex w-full items-center justify-between px-6 py-4">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-primary/15" />
      <div className="flex flex-col">
        <p className="text-base font-semibold leading-6 tracking-tight">
          Lumia Admin
        </p>
        <p className="text-xs text-muted-foreground ">
          Header placeholder content
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        Invite teammate
      </Button>
      <Button size="sm">New project</Button>
    </div>
  </div>
);

export const PlaceholderScaffold: Story = {
  render: () => (
    <AdminShell header={<Header />} sidebar={<Sidebar />}>
      <div className="flex flex-col gap-5 p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {['Live users', 'Open issues', 'Storage'].map((metric, index) => (
            <Card key={metric} className="bg-background/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>{metric}</CardDescription>
                <CardTitle className="text-2xl">
                  {index === 0 ? '1,284' : index === 1 ? '42' : '78%'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground ">
                Updated just now · placeholder data.
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-background/80 shadow-sm">
          <CardHeader>
            <CardTitle>What to build</CardTitle>
            <CardDescription>
              AdminShell keeps the layout responsive with header + sidebar
              slots.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Flex
              align="center"
              justify="between"
              className="rounded-lg border border-border/70 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Replace these placeholders
                </p>
                <p className="text-sm text-muted-foreground ">
                  Swap in your navigation, breadcrumbs, and user menus.
                </p>
              </div>
              <Button size="sm" variant="outline">
                Customize shell
              </Button>
            </Flex>

            <p className="text-sm text-muted-foreground ">
              Content area below uses standard spacing so routed pages feel
              consistent.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  ),
};
