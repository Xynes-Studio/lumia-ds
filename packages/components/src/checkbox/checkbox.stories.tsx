/* istanbul ignore file */
import type { CheckboxProps } from './checkbox';
import { Checkbox } from './checkbox';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: {
    label: 'Subscribe to newsletter',
    hint: 'Get updates every week',
  },
};

export default meta;

export const Playground = (args: CheckboxProps) => <Checkbox {...args} />;

export const States = () => (
  <div className="flex flex-col gap-4 bg-background p-6">
    <Checkbox label="Default" />
    <Checkbox defaultChecked label="Checked" hint="Already opted in" />
    <Checkbox indeterminate label="Indeterminate" hint="Partially selected" />
    <Checkbox invalid label="Invalid" hint="Please confirm" />
    <Checkbox disabled label="Disabled" hint="Not available right now" />
  </div>
);
