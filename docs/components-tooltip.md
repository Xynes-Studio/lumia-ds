# Tooltip (DS-906)

Radix-based tooltip primitive with DS tokens for background, text, and rounded corners.

## Exports
- `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent` from `@lumia-ui/components`.

## Props & defaults
- `TooltipProvider` passes through Radix props; defaults to `delayDuration=150ms` and `disableHoverableContent=true` for quick, non-sticky hints.
- `Tooltip` is the Radix `Root`.
- `TooltipTrigger` forwards Radix trigger props and uses `asChild` by default so any element (button, icon, etc.) can be the trigger.
- `TooltipContent` accepts Radix content props; defaults `sideOffset=8`, applies DS foreground/bg typography tokens, includes arrow, and sets `role="tooltip"`.

## Usage
```tsx
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@lumia-ui/components';

export function Example() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="secondary">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent side="top">Short helper copy</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

## Notes
- Hover/focus shows the tooltip; pointer leave/blur hides it. Content is portal-mounted and focusable via Radix behavior.
- Works with any trigger element because `asChild` is default; pass `asChild={false}` to render a native button trigger.***
