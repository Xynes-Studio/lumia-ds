/* istanbul ignore file */
import type { FlexProps } from './flex';
import { Flex } from './flex';
import { Button } from '../button/button';
import { Input } from '../input/input';

const meta = {
  title: 'Components/Flex',
  component: Flex,
  argTypes: {
    direction: {
      control: 'select',
      options: ['row', 'row-reverse', 'col', 'col-reverse'],
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch', 'baseline'],
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
    },
    gap: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
    },
    wrap: {
      control: 'select',
      options: ['nowrap', 'wrap', 'wrap-reverse'],
    },
  },
};

export default meta;

export const Playground = (args: FlexProps) => (
  <Flex {...args}>
    <div className="flex h-12 w-12 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-sm font-medium text-primary">
      A
    </div>
    <div className="flex h-12 w-12 items-center justify-center rounded-md border border-secondary/30 bg-secondary/10 text-sm font-medium text-secondary">
      B
    </div>
    <div className="flex h-12 w-12 items-center justify-center rounded-md border border-muted bg-background text-sm font-medium text-foreground">
      C
    </div>
    <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted text-sm font-medium text-foreground">
      D
    </div>
  </Flex>
);

Playground.args = {
  direction: 'row',
  align: 'center',
  justify: 'between',
  gap: 'md',
  wrap: 'wrap',
  className: 'w-full rounded-lg border border-border bg-muted/40 p-4',
};

export const HorizontalRowWithSpacing = () => (
  <div className="bg-background p-6">
    <Flex
      direction="row"
      align="center"
      justify="start"
      gap="lg"
      className="w-full rounded-lg border border-border bg-muted/30 p-4 shadow-sm"
    >
      <Button size="sm" variant="secondary">
        Edit
      </Button>
      <Button size="sm">Save changes</Button>
      <Button size="sm" variant="ghost">
        Preview
      </Button>
      <Button size="sm" variant="outline">
        Duplicate
      </Button>
    </Flex>
  </div>
);

export const VerticalFormLayout = () => (
  <div className="bg-background p-6">
    <Flex
      direction="col"
      align="stretch"
      gap="md"
      className="max-w-xl rounded-lg border border-border bg-muted/30 p-6 shadow-sm"
    >
      <div className="flex flex-col gap-1.5">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="flex-form-name"
        >
          Name
        </label>
        <Input id="flex-form-name" placeholder="Enter a name" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="flex-form-email"
        >
          Email
        </label>
        <Input id="flex-form-email" placeholder="you@example.com" />
      </div>
      <Flex gap="sm" justify="end">
        <Button size="sm" variant="ghost">
          Cancel
        </Button>
        <Button size="sm">Send</Button>
      </Flex>
    </Flex>
  </div>
);

export const ResponsiveToolbar = () => (
  <div className="bg-background p-6">
    <Flex
      direction={{ base: 'col', sm: 'row' }}
      align={{ base: 'stretch', sm: 'center' }}
      justify="between"
      gap="sm"
      wrap={{ base: 'wrap', md: 'nowrap' }}
      className="w-full rounded-lg border border-border bg-muted/30 p-4 shadow-sm"
    >
      <Flex
        flex="1"
        gap="sm"
        align={{ base: 'stretch', sm: 'center' }}
        wrap={{ base: 'wrap', sm: 'nowrap' }}
      >
        <Input
          placeholder="Search items"
          className="min-w-[200px] sm:min-w-[240px]"
        />
        <Button size="sm" variant="secondary" className="whitespace-nowrap">
          Filters
        </Button>
        <Button size="sm" variant="outline" className="whitespace-nowrap">
          Sort
        </Button>
      </Flex>
      <Flex gap="sm" wrap={{ base: 'wrap', sm: 'nowrap' }} justify="end">
        <Button size="sm" variant="ghost">
          Reset
        </Button>
        <Button size="sm">Apply</Button>
      </Flex>
    </Flex>
  </div>
);
