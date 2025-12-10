/* istanbul ignore file */
import { useState } from 'react';
import type { SliderProps } from './slider';
import { Slider } from './slider';

const meta = {
  title: 'Components/Slider',
  component: Slider,
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    showValue: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;

export const Playground = (args: SliderProps) => {
  const [current, setCurrent] = useState(args.value);

  return (
    <div className="space-y-4">
      <Slider {...args} value={current} onChange={(next) => setCurrent(next)} />
      <p className="text-sm text-muted-foreground">
        Drag the thumb or use arrow keys for fine control. The optional value
        readout keeps the current number visible.
      </p>
    </div>
  );
};

Playground.args = {
  value: 40,
  min: 0,
  max: 100,
  step: 5,
  showValue: true,
};

export const Ranges = () => {
  const [volume, setVolume] = useState(65);
  const [opacity, setOpacity] = useState(0.4);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Volume</p>
        <Slider
          min={0}
          max={100}
          step={1}
          value={volume}
          showValue
          onChange={setVolume}
          aria-label="Volume"
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Opacity</p>
        <Slider
          min={0}
          max={1}
          step={0.1}
          value={opacity}
          showValue
          onChange={setOpacity}
          aria-label="Opacity"
        />
      </div>
    </div>
  );
};
