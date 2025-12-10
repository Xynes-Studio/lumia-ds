/* istanbul ignore file */
import type { SkeletonProps } from './skeleton';
import { Skeleton } from './skeleton';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  argTypes: {
    rounded: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'full'],
    },
  },
};

export default meta;

export const Playground = (args: SkeletonProps) => (
  <div className="space-y-3">
    <Skeleton {...args} />
    <Skeleton {...args} width="65%" />
  </div>
);

Playground.args = {
  width: '100%',
  height: 16,
  rounded: 'md',
};

export const TextBlock = () => (
  <div className="space-y-2">
    <Skeleton width="32%" height={12} />
    <Skeleton width="86%" height={10} />
    <Skeleton width="90%" height={10} />
    <Skeleton width="75%" height={10} />
  </div>
);

export const CardTemplate = () => (
  <div className="w-[360px] space-y-4 rounded-lg border border-border bg-background p-4">
    <div className="flex items-center gap-3">
      <Skeleton width={48} height={48} rounded="full" />
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" height={12} />
        <Skeleton width="32%" height={10} />
      </div>
    </div>

    <div className="space-y-2">
      <Skeleton height={12} />
      <Skeleton width="92%" height={12} />
      <Skeleton width="82%" height={12} />
    </div>

    <div className="grid grid-cols-3 gap-3">
      <Skeleton height={40} rounded="sm" />
      <Skeleton height={40} rounded="sm" />
      <Skeleton height={40} rounded="sm" />
    </div>
  </div>
);
