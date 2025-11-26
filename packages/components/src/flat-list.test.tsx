import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import { FlatList } from './flat-list';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('FlatList component', () => {
  it('renders all items when data set is small', async () => {
    const data = ['apple', 'banana', 'citrus'];
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <FlatList
          data={data}
          estimatedItemSize={40}
          renderItem={({ item }) => <div className="row">{item}</div>}
          scrollContainerProps={{ style: { height: 200 } }}
        />,
      );
    });

    const rows = host.querySelectorAll('.row');
    expect(rows.length).toBe(3);
    expect(host.textContent).toContain('apple');
    expect(host.textContent).toContain('banana');
    expect(host.textContent).toContain('citrus');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('virtualizes large data while keeping total size accurate', async () => {
    const data = Array.from({ length: 100 }, (_, index) => `Item ${index + 1}`);
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <FlatList
          data={data}
          estimatedItemSize={40}
          overscan={1}
          renderItem={({ item, index }) => (
            <div className="row" data-index={index}>
              {item}
            </div>
          )}
          scrollContainerProps={{
            style: { height: 200 },
            'data-testid': 'list',
          }}
        />,
      );
    });

    const container = host.querySelector(
      '[data-testid="list"]',
    ) as HTMLDivElement | null;
    expect(container).toBeTruthy();

    const inner = container?.firstElementChild as HTMLDivElement | null;
    expect(inner?.style.height).toBe(`${data.length * 40}px`);

    const renderedRows = inner?.querySelectorAll('.row') ?? [];
    expect(renderedRows.length).toBeGreaterThan(0);
    expect(renderedRows.length).toBeLessThan(data.length);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('reports visible indices when scrolling', async () => {
    const data = Array.from({ length: 20 }, (_, index) => `Row ${index}`);
    const onViewableItemsChanged = vi.fn();
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <FlatList
          data={data}
          estimatedItemSize={50}
          overscan={0}
          onViewableItemsChanged={onViewableItemsChanged}
          renderItem={({ item, index }) => (
            <div className="row" data-index={index}>
              {item}
            </div>
          )}
          scrollContainerProps={{
            style: { height: 150 },
            'data-testid': 'viewable-list',
          }}
        />,
      );
    });

    const container = host.querySelector(
      '[data-testid="viewable-list"]',
    ) as HTMLDivElement | null;
    expect(container).not.toBeNull();

    const initialCall =
      onViewableItemsChanged.mock.calls[
        onViewableItemsChanged.mock.calls.length - 1
      ]?.[0];

    expect(initialCall?.visibleItems.map(({ index }) => index)).toEqual([
      0, 1, 2,
    ]);

    await act(async () => {
      if (!container) return;
      container.scrollTop = 200;
      container.dispatchEvent(new Event('scroll', { bubbles: true }));
      await Promise.resolve();
    });

    const lastCall =
      onViewableItemsChanged.mock.calls[
        onViewableItemsChanged.mock.calls.length - 1
      ]?.[0];

    expect(lastCall?.visibleItems.map(({ index }) => index)).toEqual([4, 5, 6]);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('invokes end reached and viewability callbacks', async () => {
    const data = Array.from({ length: 50 }, (_, index) => `Row ${index}`);
    const onEndReached = vi.fn();
    const onViewableItemsChanged = vi.fn();
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <FlatList
          data={data}
          estimatedItemSize={20}
          overscan={1}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.8}
          onViewableItemsChanged={onViewableItemsChanged}
          renderItem={({ item }) => <div className="row">{item}</div>}
          scrollContainerProps={{
            style: { height: 200 },
            'data-testid': 'callback-list',
          }}
        />,
      );
    });

    expect(onViewableItemsChanged).toHaveBeenCalled();

    const container = host.querySelector(
      '[data-testid="callback-list"]',
    ) as HTMLDivElement;

    await act(async () => {
      container.scrollTop = (data.length - 1) * 20;
      container.dispatchEvent(new Event('scroll', { bubbles: true }));
    });

    expect(onEndReached).toHaveBeenCalledTimes(1);
    expect(
      onViewableItemsChanged.mock.calls[
        onViewableItemsChanged.mock.calls.length - 1
      ]?.[0]?.visibleItems?.length ?? 0,
    ).toBeGreaterThan(0);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
