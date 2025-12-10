/* istanbul ignore file */
import type { RadioProps } from './radio';
import { Radio } from './radio';

const meta = {
  title: 'Components/Radio',
  component: Radio,
  args: {
    name: 'contact',
    value: 'email',
    label: 'Email',
    hint: 'We will reach you via email',
  },
};

export default meta;

export const Playground = (args: RadioProps) => <Radio {...args} />;

export const Group = () => (
  <div className="flex flex-col gap-3 bg-background p-6">
    <p className="text-sm font-medium text-foreground">Preferred contact</p>
    <Radio
      name="contact-method"
      value="email"
      label="Email"
      hint="Async and non-intrusive"
      defaultChecked
    />
    <Radio
      name="contact-method"
      value="sms"
      label="Text message"
      hint="Quick updates"
    />
    <Radio
      name="contact-method"
      value="call"
      label="Phone call"
      hint="For urgent topics"
      invalid
    />
    <Radio name="contact-method" value="none" label="Do not contact" disabled />
  </div>
);
