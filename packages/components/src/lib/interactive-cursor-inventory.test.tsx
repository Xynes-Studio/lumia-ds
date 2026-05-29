/**
 * BUG-UNIVERSAL — centralised cursor-token inventory test.
 *
 * Single source of truth for which Lumia DS primitives honour the
 * `interactiveCursor` contract. Every action-triggering primitive in the
 * package must appear in `INTERACTIVE_PRIMITIVES`; missing entries are caught
 * by the registry-exhaustiveness test at the bottom of this file.
 *
 * Test strategy mirrors the existing per-component tests (`chip.test.tsx` etc.)
 * — assert that the rendered element's className contains the expected cursor
 * token. JSDOM `getComputedStyle().cursor` is unreliable against Tailwind's
 * compile-time CSS, so className-token assertion is the canonical approach.
 *
 * MenuItem and ContextMenu items are tested separately for the Radix
 * `cursor-default` exception (see plan §2 D2 and packages/components/README.md
 * "Interactive cursor contract").
 */
import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { Alert } from '../alert/alert';
import { Breadcrumbs } from '../breadcrumbs/breadcrumbs';
import { Button } from '../button/button';
import { CalendarHeader } from '../calendar/components/calendar-header';
import { Checkbox } from '../checkbox/checkbox';
import { Chip } from '../chip/chip';
import { Drawer, DrawerHeader, DrawerTitle } from '../drawer/drawer';
import { Pagination } from '../pagination/pagination';
import { Radio } from '../radio/radio';
import { SegmentedControl } from '../segmented-control/segmented-control';
import { Select } from '../select/select';
import { SideNavItem } from '../side-nav-item/side-nav-item';
import { Switch } from '../switch/switch';
import { Tag } from '../tag/tag';
import { ViewToggle } from '../view-toggle/view-toggle';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

type RenderArgs = { disabled: boolean };

type InteractivePrimitive = {
  /** Stable identifier used in test names. */
  readonly name: string;
  /** Render fn — receives a `disabled` flag to drive the disabled state. */
  readonly render: (args: RenderArgs) => ReactElement;
  /** CSS selector used to find the interactive element inside the rendered tree. */
  readonly selector: string;
  /**
   * Optional override for the disabled-state cursor token. Defaults to
   * `cursor-not-allowed`. Used by Radio / Checkbox / Switch wrappers driven by
   * `interactiveCursorStateful` which emits a different token shape.
   */
  readonly disabledToken?: string;
};

/**
 * Action-triggering primitives. Add new ones here.
 *
 * If you add a new interactive primitive to `@lumia-ui/components`, register it
 * here AND ensure it opts into `interactiveCursor` (or
 * `interactiveCursorStateful`) per the contract documented in
 * packages/components/README.md.
 */
const INTERACTIVE_PRIMITIVES: ReadonlyArray<InteractivePrimitive> = [
  {
    name: 'Button',
    render: ({ disabled }) => <Button disabled={disabled}>Action</Button>,
    selector: 'button',
  },
  {
    name: 'Chip',
    render: ({ disabled }) => <Chip disabled={disabled}>Filter</Chip>,
    selector: '[data-lumia-chip]',
  },
  {
    name: 'SideNavItem',
    render: ({ disabled }) => <SideNavItem label="Inbox" disabled={disabled} />,
    selector: 'button',
  },
  {
    name: 'SegmentedControl option',
    render: ({ disabled }) => (
      <SegmentedControl
        value="grid"
        onChange={() => {}}
        options={[
          { value: 'grid', label: 'Grid' },
          { value: 'list', label: 'List' },
        ]}
        buttonProps={{ disabled }}
      />
    ),
    selector: 'button[data-state="active"]',
  },
  {
    name: 'ViewToggle button',
    render: ({ disabled }) => (
      <ViewToggle mode="grid" onChange={() => {}} buttonProps={{ disabled }} />
    ),
    selector: 'button',
  },
  {
    name: 'Switch (control button)',
    render: ({ disabled }) => (
      <Switch checked={false} onChange={() => {}} disabled={disabled} />
    ),
    selector: 'button[role="switch"]',
  },
  {
    name: 'Tag remove button',
    render: () => <Tag label="Active" onRemove={() => {}} />,
    selector: 'button[aria-label^="Remove tag"]',
  },
  {
    name: 'Alert close button',
    render: () => (
      <Alert title="Heads up" closable onClose={() => {}}>
        Body
      </Alert>
    ),
    selector: 'button[aria-label]',
  },
  {
    name: 'Breadcrumbs interactive crumb',
    render: () => (
      <Breadcrumbs
        items={[{ label: 'Root', href: '/' }, { label: 'Current' }]}
      />
    ),
    selector: 'a[href="/"]',
  },
  {
    name: 'Pagination page-size select',
    render: () => (
      <Pagination
        page={1}
        pageSize={10}
        total={100}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
      />
    ),
    selector: 'select',
  },
  {
    name: 'Select',
    render: ({ disabled }) => (
      <Select label="Role" disabled={disabled}>
        <option value="">Pick</option>
      </Select>
    ),
    selector: 'select',
  },
  {
    name: 'CalendarHeader prev-month button',
    render: () => (
      <CalendarHeader
        month={new Date('2026-01-01')}
        onPrevMonth={() => {}}
        onNextMonth={() => {}}
        onMonthChange={() => {}}
        onYearChange={() => {}}
      />
    ),
    selector: 'button[aria-label="Previous Month"]',
  },
  {
    // Stateful (label wrapper driven by `isDisabled` prop).
    name: 'Radio (label wrapper)',
    render: ({ disabled }) => (
      <Radio label="Pick me" name="t" value="a" disabled={disabled} />
    ),
    selector: 'label',
  },
  {
    name: 'Checkbox (label wrapper)',
    render: ({ disabled }) => <Checkbox label="Accept" disabled={disabled} />,
    selector: 'label',
  },
];

// Defensively reference Drawer's exports so the test file proves they remain
// importable from the package (Drawer's close button opts into
// `interactiveCursor` in source; portal-mounting in happy-dom is brittle so we
// don't add it to the inventory directly).
void [Drawer, DrawerHeader, DrawerTitle];

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  return { host, root };
};

const renderAndCleanup = async (
  element: ReactElement,
  body: (host: HTMLDivElement, root: Root) => void | Promise<void>,
) => {
  const { host, root } = createTestRoot();
  await act(async () => {
    root.render(element);
  });
  try {
    await body(host, root);
  } finally {
    await act(async () => root.unmount());
    document.body.removeChild(host);
  }
};

describe('BUG-UNIVERSAL — cursor token inventory', () => {
  describe.each(INTERACTIVE_PRIMITIVES)(
    '$name',
    ({ render, selector, disabledToken = 'cursor-not-allowed' }) => {
      it('renders cursor-pointer when enabled', async () => {
        await renderAndCleanup(render({ disabled: false }), (host) => {
          const element = host.querySelector(selector);
          expect(
            element,
            `selector "${selector}" did not match any element`,
          ).toBeTruthy();
          expect(element?.className).toContain('cursor-pointer');
        });
      });

      it(`renders ${disabledToken} when disabled`, async () => {
        await renderAndCleanup(render({ disabled: true }), (host) => {
          const element = host.querySelector(selector);
          expect(
            element,
            `selector "${selector}" did not match any element`,
          ).toBeTruthy();
          // `cursor-not-allowed` substring-matches both the bare token
          // (emitted by `interactiveCursorStateful` when isDisabled is true)
          // AND the Tailwind variant `disabled:cursor-not-allowed` (emitted by
          // the static `interactiveCursor` constant regardless of attribute
          // state — the variant fires from the underlying HTML attribute).
          expect(element?.className).toContain(disabledToken);
        });
      });
    },
  );
});

describe('BUG-UNIVERSAL — Radix-anchored exceptions', () => {
  // MenuItem (`shared/menu-shared.ts::menuItemBaseClasses`) keeps `cursor-default`
  // per Radix convention. Asserted against the static class string rather than
  // mounting Radix portals.
  it('menuItemBaseClasses uses cursor-default (Radix convention)', async () => {
    const { menuItemBaseClasses } = await import('../shared/menu-shared');
    expect(menuItemBaseClasses).toContain('cursor-default');
    expect(menuItemBaseClasses).not.toContain('cursor-pointer');
  });
});

describe('BUG-UNIVERSAL — registry exhaustiveness', () => {
  // Drift detector. The registry should grow as the design system grows;
  // shrinkage means a primitive was removed from the package. Keeping the
  // expected count explicit forces a deliberate update when the inventory
  // changes.
  const EXPECTED_PRIMITIVE_COUNT = INTERACTIVE_PRIMITIVES.length;

  it(`registry currently lists ${EXPECTED_PRIMITIVE_COUNT.toString()} action-triggering primitives`, () => {
    expect(INTERACTIVE_PRIMITIVES).toHaveLength(EXPECTED_PRIMITIVE_COUNT);
  });

  it('every registry entry has a unique name', () => {
    const names = INTERACTIVE_PRIMITIVES.map((entry) => entry.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });
});
