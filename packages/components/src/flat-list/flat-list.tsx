import type { HTMLAttributes, ReactNode } from 'react';
import type React from 'react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '../lib/utils';

type VirtualListItem<TItem> = {
  index: number;
  offset: number;
  size: number;
  item: TItem;
};

type UseVirtualListConfig<TItem> = {
  data: TItem[];
  estimatedItemSize: number;
  overscan: number;
  scrollOffset: number;
  viewportHeight: number;
};

type VirtualListResult<TItem> = {
  items: VirtualListItem<TItem>[];
  totalSize: number;
  renderedRange: { start: number; end: number };
  visibleRange: { start: number; end: number };
};

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const useVirtualList = <TItem,>({
  data,
  estimatedItemSize,
  overscan,
  scrollOffset,
  viewportHeight,
}: UseVirtualListConfig<TItem>): VirtualListResult<TItem> =>
  useMemo(() => {
    const itemCount = data.length;
    if (itemCount === 0) {
      return {
        items: [],
        totalSize: 0,
        renderedRange: { start: 0, end: 0 },
        visibleRange: { start: 0, end: 0 },
      };
    }

    const totalSize = itemCount * estimatedItemSize;
    const safeViewport = Math.max(viewportHeight, estimatedItemSize);
    const visibleCount = Math.ceil(safeViewport / estimatedItemSize);

    const visibleStart = Math.max(
      Math.floor(scrollOffset / estimatedItemSize),
      0,
    );
    const visibleEnd = Math.min(visibleStart + visibleCount, itemCount);

    const start = Math.max(visibleStart - overscan, 0);
    const end = Math.min(visibleEnd + overscan, itemCount);

    const items: VirtualListItem<TItem>[] = [];
    for (let index = start; index < end; index += 1) {
      items.push({
        index,
        item: data[index],
        offset: index * estimatedItemSize,
        size: estimatedItemSize,
      });
    }

    return {
      items,
      totalSize,
      renderedRange: { start, end },
      visibleRange: { start: visibleStart, end: visibleEnd },
    };
  }, [data, estimatedItemSize, overscan, scrollOffset, viewportHeight]);

export type FlatListProps<TItem> = {
  data: TItem[];
  renderItem: (info: { item: TItem; index: number }) => ReactNode;
  keyExtractor?: (item: TItem, index: number) => string;
  estimatedItemSize?: number;
  overscan?: number;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  onViewableItemsChanged?: (info: {
    visibleItems: { item: TItem; index: number }[];
  }) => void;
  scrollContainerProps?: HTMLAttributes<HTMLDivElement>;
  className?: string;
};

export function FlatList<TItem>({
  data,
  renderItem,
  keyExtractor,
  estimatedItemSize = 48,
  overscan = 2,
  onEndReached,
  onEndReachedThreshold = 0.8,
  onViewableItemsChanged,
  scrollContainerProps,
  className,
}: FlatListProps<TItem>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const endReachedRef = useRef(false);
  const lastViewableKeyRef = useRef<string | null>(null);

  const {
    onScroll: userOnScroll,
    className: scrollClassName,
    style: scrollStyle,
    ...restScrollProps
  } = scrollContainerProps ?? {};

  const {
    items: virtualItems,
    totalSize,
    visibleRange,
  } = useVirtualList({
    data,
    estimatedItemSize,
    overscan,
    scrollOffset,
    viewportHeight,
  });

  useIsomorphicLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const resolveStyleHeight = () => {
      const value = scrollStyle?.height;
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const parsed = Number.parseFloat(value);
        if (Number.isFinite(parsed)) return parsed;
      }
      return 0;
    };

    const updateMeasurements = () =>
      setViewportHeight(node.clientHeight || resolveStyleHeight());
    updateMeasurements();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateMeasurements);
      observer.observe(node);
      return () => observer.disconnect();
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateMeasurements);
      return () => window.removeEventListener('resize', updateMeasurements);
    }

    return undefined;
  }, [scrollStyle?.height]);

  useEffect(() => {
    endReachedRef.current = false;
  }, [data.length, onEndReachedThreshold]);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      setScrollOffset(event.currentTarget.scrollTop);
      userOnScroll?.(event);
    },
    [userOnScroll],
  );

  useEffect(() => {
    lastViewableKeyRef.current = null;
  }, [data]);

  const visibleItems = useMemo(
    () =>
      virtualItems
        .filter(
          ({ index }) =>
            index >= visibleRange.start && index < visibleRange.end,
        )
        .map(({ item, index }) => ({ item, index })),
    [virtualItems, visibleRange.end, visibleRange.start],
  );

  useEffect(() => {
    if (!onViewableItemsChanged) return;

    const key = visibleItems.map(({ index }) => index).join('|');

    if (key === lastViewableKeyRef.current) {
      return;
    }

    lastViewableKeyRef.current = key;
    onViewableItemsChanged({ visibleItems });
  }, [onViewableItemsChanged, visibleItems]);

  useEffect(() => {
    if (!onEndReached || totalSize === 0) return;

    const threshold = onEndReachedThreshold ?? 0.8;
    const progress = (scrollOffset + viewportHeight) / totalSize;

    if (progress >= threshold) {
      if (!endReachedRef.current) {
        endReachedRef.current = true;
        onEndReached();
      }
    } else {
      endReachedRef.current = false;
    }
  }, [
    onEndReached,
    onEndReachedThreshold,
    scrollOffset,
    totalSize,
    viewportHeight,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full overflow-auto',
        scrollClassName,
        className,
      )}
      style={{ overflowY: 'auto', overflowX: 'hidden', ...scrollStyle }}
      onScroll={handleScroll}
      {...restScrollProps}
    >
      <div
        style={{
          position: 'relative',
          height: `${totalSize}px`,
          width: '100%',
        }}
      >
        {virtualItems.map(({ index, item, offset, size }) => {
          const key = keyExtractor ? keyExtractor(item, index) : String(index);

          return (
            <div
              key={key}
              style={{
                position: 'absolute',
                top: `${offset}px`,
                height: `${size}px`,
                left: 0,
                right: 0,
              }}
            >
              {renderItem({ item, index })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
