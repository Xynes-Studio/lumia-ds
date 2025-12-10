/* istanbul ignore file */
import type { ProgressBarProps } from './progress-bar';
import { ProgressBar } from './progress-bar';

const meta = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
    indeterminate: {
      control: 'boolean',
    },
  },
};

export default meta;

export const Playground = (args: ProgressBarProps) => (
  <div className="space-y-4">
    <ProgressBar {...args} />
    <div className="rounded-md border border-dashed border-border/80 bg-muted/50 p-4">
      <p className="text-sm text-muted-foreground ">
        Determinate progress uses the provided value; indeterminate shows a
        steady pulse without shifting layout.
      </p>
    </div>
  </div>
);

Playground.args = {
  value: 64,
  indeterminate: false,
};

export const LoadingStates = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">Determinate</p>
      <ProgressBar value={32} aria-label="Uploading assets" />
    </div>
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">Indeterminate</p>
      <ProgressBar value={0} indeterminate aria-label="Syncing data" />
    </div>
  </div>
);
