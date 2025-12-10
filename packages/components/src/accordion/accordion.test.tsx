import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  type AccordionProps,
} from './accordion';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

const BasicAccordion = (props?: Partial<AccordionProps>) => (
  <Accordion {...props}>
    <AccordionItem value="item-1">
      <AccordionTrigger>First</AccordionTrigger>
      <AccordionContent>First content</AccordionContent>
    </AccordionItem>
    <AccordionItem value="item-2">
      <AccordionTrigger>Second</AccordionTrigger>
      <AccordionContent>Second content</AccordionContent>
    </AccordionItem>
    <AccordionItem value="item-3">
      <AccordionTrigger>Third</AccordionTrigger>
      <AccordionContent>Third content</AccordionContent>
    </AccordionItem>
  </Accordion>
);

describe('Accordion', () => {
  it('opens and closes items in single mode', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<BasicAccordion defaultValue="item-1" />);
    });

    const triggers = host.querySelectorAll('[data-lumia-accordion-trigger]');
    const content = host.querySelectorAll('[data-lumia-accordion-content]');

    expect(triggers[0]?.getAttribute('aria-expanded')).toBe('true');
    expect(content[0]?.getAttribute('data-state')).toBe('open');
    expect(content[1]?.getAttribute('data-state')).toBe('closed');

    await act(async () => {
      (triggers[1] as HTMLButtonElement).dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
    });

    expect(triggers[0]?.getAttribute('aria-expanded')).toBe('false');
    expect(triggers[1]?.getAttribute('aria-expanded')).toBe('true');
    expect(content[0]?.getAttribute('data-state')).toBe('closed');
    expect(content[1]?.getAttribute('data-state')).toBe('open');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('allows multiple items to stay open in multiple mode', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <BasicAccordion
          type="multiple"
          defaultValue={['item-1'] as string[]}
        />,
      );
    });

    const triggers = host.querySelectorAll('[data-lumia-accordion-trigger]');
    const content = host.querySelectorAll('[data-lumia-accordion-content]');

    await act(async () => {
      (triggers[1] as HTMLButtonElement).dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
    });

    expect(triggers[0]?.getAttribute('aria-expanded')).toBe('true');
    expect(triggers[1]?.getAttribute('aria-expanded')).toBe('true');
    expect(content[0]?.getAttribute('data-state')).toBe('open');
    expect(content[1]?.getAttribute('data-state')).toBe('open');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('responds to keyboard toggles and arrow navigation', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<BasicAccordion />);
    });

    const triggers = Array.from(
      host.querySelectorAll('[data-lumia-accordion-trigger]'),
    ) as HTMLButtonElement[];
    const content = host.querySelectorAll('[data-lumia-accordion-content]');

    await act(async () => {
      triggers[0]?.focus();
      triggers[0]?.dispatchEvent(
        new KeyboardEvent('keydown', { key: ' ', bubbles: true }),
      );
      triggers[0]?.dispatchEvent(
        new KeyboardEvent('keyup', { key: ' ', bubbles: true }),
      );
    });

    expect(triggers[0].getAttribute('aria-expanded')).toBe('true');
    expect(content[0]?.getAttribute('data-state')).toBe('open');

    await act(async () => {
      triggers[0]?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
    });

    expect(document.activeElement).toBe(triggers[1]);

    await act(async () => {
      triggers[1]?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
    });

    expect(triggers[1].getAttribute('aria-expanded')).toBe('true');
    expect(content[1]?.getAttribute('data-state')).toBe('open');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
