# Slider (DS-1003)

Single-thumb control for picking numeric values.

## Exports
- `Slider` from `@lumia-ui/components`.

## Props
- `value: number` – controlled value.
- `min: number`, `max: number` – numeric bounds passed to the underlying shadcn/Radix slider.
- `step?: number` – increment size (default `1`).
- `onChange(value: number)` – fired on drag or keyboard input with the next value.
- `showValue?: boolean` – when true, renders a numeric readout beside the track.
- `className?: string` plus other `SliderPrimitive.Root` props such as `aria-label` and `disabled`.

## Usage
```tsx
import { Slider } from '@lumia-ui/components';

export function VolumeControl() {
  const [volume, setVolume] = useState(64);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm font-medium">
        <span>Volume</span>
        <span className="text-muted-foreground ">{volume}%</span>
      </div>
      <Slider
        value={volume}
        min={0}
        max={100}
        step={2}
        showValue
        onChange={setVolume}
        aria-label="Volume"
      />
    </div>
  );
}
```

## Notes
- Single-thumb only; the Radix base handles pointer and keyboard interactions. Arrow keys respect the `step` prop.
- Focus rings and colors follow DS tokens (`bg-muted`, `bg-primary`, ring offsets) so the thumb stays consistent across themes.
- Disabled state forwards `aria-disabled` and dims both the track and thumb. Override layout with `className` without affecting the shared token styling.
