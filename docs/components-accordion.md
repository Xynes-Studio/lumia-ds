# Accordion (DS-1103)

Radix-based accordion/disclosure for collapsible sections with DS styling.

## Exports
- `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` from `@lumia/components`.

## Props & behavior
- `Accordion` mirrors Radix root props; supports `type="single"` (default) or `type="multiple"`, `defaultValue`/`value`, and passes through `collapsible`.
- `AccordionTrigger` is keyboard friendly: Enter/Space toggles the section; Up/Down/Left/Right navigation comes from Radix.
- Items use DS tokens for borders, background, focus rings, and include a built-in chevron indicator.

## Usage
```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@lumia/components';

export function ProjectDetails() {
  return (
    <Accordion
      type="multiple"
      defaultValue={['overview']}
      className="w-full max-w-xl"
    >
      <AccordionItem value="overview">
        <AccordionTrigger>Overview</AccordionTrigger>
        <AccordionContent>
          High-level context so collaborators ramp quickly.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="timeline">
        <AccordionTrigger>Timeline</AccordionTrigger>
        <AccordionContent>
          Milestones, dependencies, and current status.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="risks">
        <AccordionTrigger>Risks</AccordionTrigger>
        <AccordionContent>
          Known risks, assumptions, and mitigations.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
```

## Accessibility notes
- Trigger manages `aria-expanded` and is focusable; Enter/Space toggles open/close.
- Arrow keys move focus between triggers via Radix behavior.
- Content is in the normal flow (not portal) and uses `aria-controls`/`aria-labelledby` wiring from Radix.
