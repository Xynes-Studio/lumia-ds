import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import { EmptyState, NoResults } from './empty-state';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('EmptyState component', () => {
  it('renders title and description with centered layout', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <EmptyState
          title="No data yet"
          description="Start by creating your first item."
        />,
      );
    });

    const wrapper = host.firstElementChild;
    expect(wrapper?.className).toContain('items-center');
    expect(wrapper?.className).toContain('text-center');
    expect(host.textContent).toContain('No data yet');
    expect(host.textContent).toContain('Start by creating your first item.');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('renders optional icon and actions', async () => {
    const { root, host } = createTestRoot();
    const onPrimary = vi.fn();
    const onSecondary = vi.fn();

    await act(async () => {
      root.render(
        <EmptyState
          title="Nothing here"
          icon="sparkle"
          primaryAction={{ label: 'Create', onClick: onPrimary }}
          secondaryAction={{ label: 'Learn more', onClick: onSecondary }}
        />,
      );
    });

    const icon = host.querySelector('svg');
    expect(icon).toBeTruthy();

    const buttons = host.querySelectorAll('button');
    expect(buttons).toHaveLength(2);

    buttons[0]?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    buttons[1]?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(onPrimary).toHaveBeenCalledTimes(1);
    expect(onSecondary).toHaveBeenCalledTimes(1);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});

describe('NoResults component', () => {
  it('renders default inline copy and hint for filtered views', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<NoResults />);
    });

    const wrapper = host.firstElementChild;
    expect(wrapper?.className).toContain('border-dashed');
    expect(wrapper?.textContent).toContain('No results found');
    expect(wrapper?.textContent).toContain(
      'Reset filters or clear the search to see everything.',
    );

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('allows overriding description and hiding the reset hint', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <NoResults
          description="Nothing matched those filters."
          resetHint={null}
        />,
      );
    });

    expect(host.textContent).toContain('Nothing matched those filters.');
    expect(host.textContent).not.toContain('Reset filters or clear the search');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
