# Ticker (DS-1301)

Flexible scrolling ticker for repeated inline content (announcements, metrics, activity chips) with row/column modes.

## Exports
- `Ticker`, `TickerProps` from `@lumia-ui/components`.

## Props
- `children: ReactNode` - content to render in the ticker track.
- `direction?: 'row' | 'column'` (default: `'row'`) - horizontal or vertical movement.
- `alignment?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'` (default: `'stretch'`) - cross-axis alignment passed to internal `Flex`.
- `loop?: boolean` (default: `true`) - when enabled, duplicates the child group to create a seamless loop.
- `speed?: number` (default: `40`) - pixels per second movement speed.
- `pauseOnHover?: boolean` (default: `true`) - pauses animation while hovering.
- `trackClassName?: string` - extra classes for the moving track container.
- `className` and native `HTMLDivElement` props pass through to the outer wrapper.

## Usage
```tsx
import { Badge, Flex, Ticker } from '@lumia-ui/components';

export function AnnouncementTicker() {
  return (
    <Ticker
      direction="row"
      alignment="center"
      speed={48}
      className="rounded-md border border-border bg-muted/30 px-3 py-2"
      trackClassName="gap-3"
    >
      <Flex align="center" gap="sm">
        <Badge variant="subtle">Release</Badge>
        <span className="text-sm text-foreground">v1.8 shipped to staging</span>
      </Flex>
      <Flex align="center" gap="sm">
        <Badge variant="subtle">Infra</Badge>
        <span className="text-sm text-foreground">Queue latency back to normal</span>
      </Flex>
    </Ticker>
  );
}
```

## Behavior Notes
- `Ticker` renders children inside internal `Flex` groups.
- With `loop={true}`, two identical groups are rendered; the second group is `aria-hidden="true"` to avoid duplicate screen reader output.
- With `loop={false}`, content scrolls until the end of the track and then stops.
- The outer wrapper enforces `overflow-hidden`; style spacing on child blocks or via `trackClassName`.

## Accessibility Notes
- Keep child content semantically meaningful (`<a>`, `<button>`, text regions) based on use case.
- Avoid placing rapidly changing critical alerts only in ticker format; provide a static equivalent when possible.
- If ticker items are interactive, verify keyboard focus visibility while content is moving.

## Testing
- Unit tests: `packages/components/src/ticker/ticker.test.tsx`
- Barrel/type coverage: `packages/components/src/index.test.ts`
- Run component tests:
  - `pnpm --filter @lumia-ui/components exec vitest run src/ticker/ticker.test.tsx src/index.test.ts`
  - `pnpm --filter @lumia-ui/components test`

## Implementation Notes (for contributors)
- Source: `packages/components/src/ticker/ticker.tsx`
- Built on `Flex` to keep layout behavior consistent with DS spacing/alignment conventions.
- Uses `ResizeObserver` to re-measure container and track lengths for responsive motion.
- Uses `requestAnimationFrame` for animation timing and speed-based offset updates.
