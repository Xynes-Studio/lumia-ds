import type { HTMLAttributes, ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Flex } from '../flex/flex';
import { cn } from '../lib/utils';

type TickerDirection = 'row' | 'column';
type TickerAlignment = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

type TickerMetrics = {
  containerSize: number;
  groupSize: number;
};

export type TickerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  direction?: TickerDirection;
  alignment?: TickerAlignment;
  loop?: boolean;
  speed?: number;
  pauseOnHover?: boolean;
  trackClassName?: string;
};

export function Ticker({
  children,
  direction = 'row',
  alignment = 'stretch',
  loop = true,
  speed = 40,
  pauseOnHover = true,
  className,
  trackClassName,
  onMouseEnter,
  onMouseLeave,
  ...props
}: TickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0);
  const [offset, setOffset] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [metrics, setMetrics] = useState<TickerMetrics>({
    containerSize: 0,
    groupSize: 0,
  });

  const flexDirection = direction === 'row' ? 'row' : 'col';
  const translate =
    direction === 'row'
      ? `translate3d(${-offset}px, 0, 0)`
      : `translate3d(0, ${-offset}px, 0)`;
  const travelDistance = useMemo(() => {
    if (loop) return metrics.groupSize;
    return Math.max(metrics.groupSize - metrics.containerSize, 0);
  }, [loop, metrics.containerSize, metrics.groupSize]);

  useEffect(() => {
    offsetRef.current = 0;
    setOffset(0);
  }, [children, direction, loop]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    handleChange();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    if (!prefersReducedMotion) return;

    offsetRef.current = 0;
    setOffset(0);
  }, [prefersReducedMotion]);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;

    if (!container || !track) return undefined;

    const measure = () => {
      const containerSize =
        direction === 'row' ? container.clientWidth : container.clientHeight;
      const trackSize =
        direction === 'row' ? track.scrollWidth : track.scrollHeight;
      const groupSize = loop ? trackSize / 2 : trackSize;

      setMetrics({
        containerSize,
        groupSize: Math.max(groupSize, 0),
      });
    };

    measure();

    if (typeof ResizeObserver === 'undefined') {
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
      }
      return undefined;
    }

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(track);

    return () => observer.disconnect();
  }, [direction, loop, children]);

  useEffect(() => {
    if (speed <= 0 || travelDistance <= 0 || isPaused || prefersReducedMotion) {
      return undefined;
    }

    let animationFrameId = 0;
    let previousTimestamp = 0;

    const step = (timestamp: number) => {
      if (!previousTimestamp) {
        previousTimestamp = timestamp;
      }

      const deltaSeconds = (timestamp - previousTimestamp) / 1000;
      previousTimestamp = timestamp;

      const nextOffset = offsetRef.current + speed * deltaSeconds;
      offsetRef.current = loop
        ? nextOffset % travelDistance
        : Math.min(nextOffset, travelDistance);
      setOffset(offsetRef.current);

      if (!loop && offsetRef.current >= travelDistance) return;
      animationFrameId = window.requestAnimationFrame(step);
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [isPaused, loop, speed, travelDistance]);

  return (
    <div
      ref={containerRef}
      className={cn('overflow-hidden', className)}
      data-reduced-motion={prefersReducedMotion || undefined}
      onMouseEnter={(event) => {
        if (pauseOnHover) {
          setIsPaused(true);
        }
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        if (pauseOnHover) {
          setIsPaused(false);
        }
        onMouseLeave?.(event);
      }}
      {...props}
    >
      <Flex
        ref={trackRef}
        data-testid="ticker-track"
        direction={flexDirection}
        align={alignment}
        wrap="nowrap"
        className={cn(direction === 'row' ? 'w-max' : 'h-max', trackClassName)}
        style={{
          transform: translate,
          willChange: 'transform',
        }}
      >
        <Flex
          data-testid="ticker-group"
          direction={flexDirection}
          align={alignment}
          wrap="nowrap"
          shrink={0}
        >
          {children}
        </Flex>
        {loop ? (
          <Flex
            data-testid="ticker-group"
            direction={flexDirection}
            align={alignment}
            wrap="nowrap"
            shrink={0}
            aria-hidden="true"
          >
            {children}
          </Flex>
        ) : null}
      </Flex>
    </div>
  );
}
