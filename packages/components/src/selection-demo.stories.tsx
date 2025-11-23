/* istanbul ignore file */
import { Checkbox } from './checkbox';
import { Radio } from './radio';
import { Select } from './select';

const meta = {
  title: 'Examples/Selection Controls',
};

export default meta;

export const SamplePage = () => (
  <div className="max-w-xl space-y-6 bg-background p-6 text-foreground">
    <header className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
        Lumia DS
      </p>
      <h2 className="text-xl font-semibold">Selection controls demo</h2>
      <p className="text-sm text-muted">
        Wrapped select, checkbox, and radio components with shared tokens,
        accessible labeling, and consistent focus styling.
      </p>
    </header>

    <section className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
      <h3 className="text-sm font-medium">Project role</h3>
      <Select label="Role" defaultValue="">
        <option value="">Select a role</option>
        <option value="lead">Lead</option>
        <option value="designer">Designer</option>
        <option value="engineer">Engineer</option>
      </Select>
    </section>

    <section className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
      <h3 className="text-sm font-medium">Notifications</h3>
      <Checkbox
        defaultChecked
        label="Product updates"
        hint="Release notes and changelog"
      />
      <Checkbox label="Security alerts" hint="Critical notices only" />
      <Checkbox indeterminate label="Beta programs" hint="Some teams opted in" />
    </section>

    <section className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
      <h3 className="text-sm font-medium">Delivery speed</h3>
      <Radio
        name="delivery"
        value="standard"
        label="Standard"
        hint="3-5 business days"
        defaultChecked
      />
      <Radio
        name="delivery"
        value="expedited"
        label="Expedited"
        hint="2 business days"
      />
      <Radio
        name="delivery"
        value="overnight"
        label="Overnight"
        hint="Next business day"
        invalid
      />
    </section>
  </div>
);
