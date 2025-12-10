import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { StackLayout } from './stack-layout';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('StackLayout', () => {
  it('renders the header, actions, and stacked children', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <StackLayout
          title="Invoice detail"
          actions={
            <>
              <button type="button">Edit</button>
              <button type="button">Save</button>
            </>
          }
        >
          <section>Summary card</section>
          <section>Line items</section>
        </StackLayout>,
      );
    });

    const header = host.querySelector('[data-slot="stack-header"]');
    expect(header?.textContent).toContain('Invoice detail');
    expect(header?.className).toContain('border-border');

    const actions = host.querySelector('[data-slot="stack-actions"]');
    expect(actions?.textContent).toContain('Edit');
    expect(actions?.textContent).toContain('Save');
    expect(actions?.className).toContain('gap-3');

    const body = host.querySelector('[data-slot="stack-body"]');
    expect(body?.textContent).toContain('Summary card');
    expect(body?.textContent).toContain('Line items');
    expect(body?.className).toContain('px-6');

    await act(async () => root.unmount());
    host.remove();
  });

  it('renders the example detail stack layout', async () => {
    const ExampleLayout = (
      <StackLayout
        title="Profile"
        actions={<button type="button">Update</button>}
      >
        <article>Account summary</article>
        <article>Security settings</article>
      </StackLayout>
    );

    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(ExampleLayout);
    });

    expect(host.textContent).toContain('Profile');
    expect(host.textContent).toContain('Update');
    expect(host.textContent).toContain('Account summary');
    expect(host.textContent).toContain('Security settings');

    await act(async () => root.unmount());
    host.remove();
  });
});
