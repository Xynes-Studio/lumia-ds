import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@lumia-ui/components';

import { cn } from '../lib/utils';

export type MarketingFAQItem = {
  /** Stable id used as the AccordionItem `value`. */
  id: string;
  /** Visible question text. Plain string. */
  question: string;
  /**
   * Answer body. Accepts ReactNode so consumers can include lists / inline
   * links inside the answer. Consumers MUST NOT pass raw HTML via
   * `dangerouslySetInnerHTML` — keep answers as JSX.
   */
  answer: ReactNode;
};

export type MarketingFAQProps = HTMLAttributes<HTMLElement> & {
  /** Section heading rendered as `<h2>`. */
  heading?: string;
  /** Optional sub-copy under the heading. */
  description?: string;
  /** Ordered FAQ entries. */
  items: ReadonlyArray<MarketingFAQItem>;
  /**
   * Whether multiple items can be open at once. Defaults to `false` (single
   * disclosure — closes others on open). LP-DS §6 Storybook coverage requires
   * both modes.
   */
  multiple?: boolean;
  'aria-label'?: string;
};

/**
 * FAQ disclosure list. Wraps Lumia DS `<Accordion>` with marketing-tuned
 * spacing. No new component logic — the keyboard / a11y / focus behaviour
 * is inherited from the design system.
 */
export const MarketingFAQ = forwardRef<HTMLElement, MarketingFAQProps>(
  function MarketingFAQ(
    {
      heading,
      description,
      items,
      multiple = false,
      className,
      'aria-label': ariaLabel,
      ...rest
    },
    ref,
  ) {
    const headingId = heading ? 'marketing-faq-heading' : undefined;
    return (
      <section
        ref={ref}
        aria-labelledby={headingId}
        aria-label={
          !heading ? (ariaLabel ?? 'Frequently asked questions') : undefined
        }
        data-lumia-marketing-faq=""
        className={cn(
          'mx-auto w-full max-w-[48rem] px-4 sm:px-6 py-12 sm:py-16',
          className,
        )}
        {...rest}
      >
        {heading ? (
          <div className="mb-8 flex flex-col gap-3">
            <h2
              id={headingId}
              className="m-0 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
            {description ? (
              <p className="text-base text-muted-foreground sm:text-lg">
                {description}
              </p>
            ) : null}
          </div>
        ) : null}
        <Accordion type={multiple ? 'multiple' : 'single'}>
          {items.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>
                <div className="py-3">{item.answer}</div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    );
  },
);
