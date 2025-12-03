/* istanbul ignore file */
import type { SpinnerProps } from './spinner';
import { Spinner } from './spinner';

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;

export const Playground = (args: SpinnerProps) => (
  <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 p-4">
    <Spinner {...args} />
    <span className="text-sm text-muted">Fetching results…</span>
  </div>
);

Playground.args = {
  size: 'md',
  'aria-label': 'Loading content',
};

export const Sizes = () => (
  <div className="flex items-center gap-4 text-primary">
    <Spinner size="sm" aria-label="Loading small" />
    <Spinner size="md" aria-label="Loading medium" />
    <Spinner size="lg" aria-label="Loading large" />
    <Spinner
      size={36}
      aria-label="Loading extra"
      className="text-primary-700"
    />
  </div>
);

export const InlineLayoutSafe = () => (
  <div className="flex items-center gap-2 text-sm text-foreground">
    <span className="inline-flex w-6 justify-center">
      <Spinner size="sm" aria-label="Saving" />
    </span>
    <span>Saving without nudging surrounding content.</span>
  </div>
);
