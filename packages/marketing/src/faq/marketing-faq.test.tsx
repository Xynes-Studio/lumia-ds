import { describe, expect, it } from 'vitest';

import { MarketingFAQ } from './marketing-faq';
import { createTestRoot, render, teardown } from '../lib/test-utils';

const items = [
  {
    id: 'data-residency',
    question: 'Where is my data hosted?',
    answer: 'In the EU. See SECURITY.md for the full data-flow map.',
  },
  {
    id: 'open-source',
    question: 'Is xynes open source?',
    answer: 'Yes — the platform ships under AGPL-3.0.',
  },
];

describe('<MarketingFAQ>', () => {
  it('renders each item as an AccordionItem with the question as the trigger', async () => {
    const ctx = createTestRoot();
    await render(ctx.root, <MarketingFAQ heading="FAQ" items={items} />);
    const triggers = Array.from(
      ctx.host.querySelectorAll('[data-lumia-accordion-trigger]'),
    );
    expect(triggers.length).toBe(2);
    expect(triggers[0].textContent).toContain('Where is my data hosted?');
    expect(triggers[1].textContent).toContain('Is xynes open source?');
    await teardown(ctx);
  });

  it('renders heading + description as <h2> + <p>', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingFAQ
        heading="Frequently asked questions"
        description="Short answers to common questions."
        items={items}
      />,
    );
    expect(ctx.host.querySelector('h2')?.textContent).toBe(
      'Frequently asked questions',
    );
    expect(ctx.host.textContent).toContain('Short answers');
    await teardown(ctx);
  });

  it('uses aria-label fallback when no heading is supplied', async () => {
    const ctx = createTestRoot();
    await render(ctx.root, <MarketingFAQ items={items} />);
    const section = ctx.host.querySelector('section');
    expect(section?.getAttribute('aria-label')).toBe(
      'Frequently asked questions',
    );
    expect(section?.getAttribute('aria-labelledby')).toBeNull();
    await teardown(ctx);
  });

  it('supports multi-open mode via the multiple prop', async () => {
    const ctx = createTestRoot();
    await render(ctx.root, <MarketingFAQ multiple items={items} />);
    // Radix accordion sets data-orientation + role tree on the root; we just
    // verify rendering doesn't throw and that all items render.
    expect(
      ctx.host.querySelectorAll('[data-lumia-accordion-trigger]').length,
    ).toBe(2);
    await teardown(ctx);
  });
});
