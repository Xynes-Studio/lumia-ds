/* istanbul ignore file */
import type { SelectProps } from './select';
import { Select } from './select';

const meta = {
  title: 'Components/Select',
  component: Select,
  args: {
    label: 'Favorite fruit',
    placeholder: 'Pick an option',
  },
};

export default meta;

const options = (
  <>
    <option value="">Select an option</option>
    <option value="apple">Apple</option>
    <option value="banana">Banana</option>
    <option value="cherry">Cherry</option>
  </>
);

export const Playground = (args: SelectProps) => (
  <Select {...args}>{options}</Select>
);

export const States = () => (
  <div className="flex flex-col gap-4 bg-background p-6">
    <Select label="Default" defaultValue="apple">
      {options}
    </Select>
    <Select label="With hint" hint="Choose anything you like">
      {options}
    </Select>
    <Select label="Invalid" invalid hint="Please choose one">
      {options}
    </Select>
    <Select label="Disabled" disabled defaultValue="banana">
      {options}
    </Select>
  </div>
);
