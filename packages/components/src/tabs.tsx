import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from './utils';

type TabsValue = string;

type TabsContextValue = {
  value?: TabsValue;
  baseId: string;
  orientation: 'horizontal' | 'vertical';
  registerTrigger: (
    value: TabsValue,
    ref: HTMLButtonElement | null,
    disabled: boolean,
  ) => void;
  unregisterTrigger: (value: TabsValue) => void;
  onSelect: (value: TabsValue) => void;
  focusNext: (current: TabsValue, direction: 1 | -1) => void;
  focusEdge: (edge: 'first' | 'last') => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabsContext = (component: string) => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(`${component} must be used within Tabs`);
  }
  return context;
};

export type TabsProps = HTMLAttributes<HTMLDivElement> & {
  value?: TabsValue;
  defaultValue?: TabsValue;
  onValueChange?: (value: TabsValue) => void;
  orientation?: 'horizontal' | 'vertical';
};

export const Tabs = ({
  value,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  className,
  children,
  ...props
}: TabsProps) => {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<TabsValue | undefined>(
    defaultValue,
  );
  const currentValue = isControlled ? value : internalValue;

  const currentValueRef = useRef(currentValue);
  useEffect(() => {
    currentValueRef.current = currentValue;
  }, [currentValue]);

  const triggersRef = useRef<
    Map<TabsValue, { ref: HTMLButtonElement | null; disabled: boolean }>
  >(new Map());
  const orderedValuesRef = useRef<TabsValue[]>([]);
  const baseId = useId();

  const setCurrentValue = useCallback(
    (next?: TabsValue) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      if (next !== undefined) {
        onValueChange?.(next);
      }
    },
    [isControlled, onValueChange],
  );

  const registerTrigger = useCallback(
    (tabValue: TabsValue, ref: HTMLButtonElement | null, disabled: boolean) => {
      triggersRef.current.set(tabValue, { ref, disabled });
      if (!orderedValuesRef.current.includes(tabValue)) {
        orderedValuesRef.current.push(tabValue);
      }
      if (!isControlled && currentValueRef.current === undefined && !disabled) {
        currentValueRef.current = tabValue;
        setCurrentValue(tabValue);
      }
    },
    [isControlled, setCurrentValue],
  );

  const unregisterTrigger = useCallback(
    (tabValue: TabsValue) => {
      triggersRef.current.delete(tabValue);
      orderedValuesRef.current = orderedValuesRef.current.filter(
        (valueItem) => valueItem !== tabValue,
      );
      if (!isControlled && currentValueRef.current === tabValue) {
        const fallback = orderedValuesRef.current.find((candidate) => {
          const entry = triggersRef.current.get(candidate);
          return entry && !entry.disabled;
        });
        currentValueRef.current = fallback;
        setCurrentValue(fallback);
      }
    },
    [isControlled, setCurrentValue],
  );

  const focusEdge = useCallback(
    (edge: 'first' | 'last') => {
      const orderedValues =
        edge === 'first'
          ? orderedValuesRef.current
          : [...orderedValuesRef.current].reverse();
      const target = orderedValues.find((valueItem) => {
        const entry = triggersRef.current.get(valueItem);
        return entry && !entry.disabled;
      });
      if (target) {
        const entry = triggersRef.current.get(target);
        entry?.ref?.focus();
        currentValueRef.current = target;
        setCurrentValue(target);
      }
    },
    [setCurrentValue],
  );

  const focusNext = useCallback(
    (startValue: TabsValue, direction: 1 | -1) => {
      const values = orderedValuesRef.current;
      if (values.length === 0) return;

      const startIndex = values.indexOf(startValue);
      let index = startIndex === -1 ? 0 : startIndex;

      for (let step = 0; step < values.length; step += 1) {
        index =
          startIndex === -1 && step === 0
            ? 0
            : (index + direction + values.length) % values.length;
        const candidate = values[index];
        const entry = triggersRef.current.get(candidate);
        if (entry && !entry.disabled) {
          entry.ref?.focus();
          currentValueRef.current = candidate;
          setCurrentValue(candidate);
          break;
        }
      }
    },
    [setCurrentValue],
  );

  const contextValue = useMemo(
    () => ({
      value: currentValue,
      baseId,
      orientation,
      registerTrigger,
      unregisterTrigger,
      onSelect: (nextValue: TabsValue) => {
        if (!isControlled || currentValueRef.current !== nextValue) {
          currentValueRef.current = nextValue;
          setCurrentValue(nextValue);
        } else {
          onValueChange?.(nextValue);
        }
      },
      focusNext,
      focusEdge,
    }),
    [
      baseId,
      currentValue,
      orientation,
      registerTrigger,
      unregisterTrigger,
      isControlled,
      setCurrentValue,
      focusNext,
      focusEdge,
      onValueChange,
    ],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn('flex flex-col gap-3', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export type TabsListProps = HTMLAttributes<HTMLDivElement>;

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  function TabsList({ className, ...props }, ref) {
    const { orientation } = useTabsContext('TabsList');

    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation={orientation}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg border border-border bg-muted/60 p-1',
          className,
        )}
        {...props}
      />
    );
  },
);

export type TabsTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  value: TabsValue;
};

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  function TabsTrigger(
    { className, value, disabled = false, onClick, onKeyDown, ...props },
    ref,
  ) {
    const {
      value: activeValue,
      baseId,
      registerTrigger,
      unregisterTrigger,
      onSelect,
      focusNext,
      focusEdge,
    } = useTabsContext('TabsTrigger');

    const triggerRef = useRef<HTMLButtonElement | null>(null);
    useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement);

    useEffect(() => {
      return () => unregisterTrigger(value);
    }, [unregisterTrigger, value]);

    const setTriggerRef = useCallback(
      (node: HTMLButtonElement | null) => {
        triggerRef.current = node;
        registerTrigger(value, node, Boolean(disabled));
      },
      [disabled, registerTrigger, value],
    );

    const isActive = activeValue === value;
    const triggerId = `${baseId}-tab-${value}`;
    const panelId = `${baseId}-panel-${value}`;

    const handleClick: TabsTriggerProps['onClick'] = (event) => {
      onClick?.(event);
      if (!disabled && !event.defaultPrevented) {
        onSelect(value);
      }
    };

    const handleKeyDown: TabsTriggerProps['onKeyDown'] = (event) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || disabled) return;
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          focusNext(value, 1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          focusNext(value, -1);
          break;
        case 'Home':
          event.preventDefault();
          focusEdge('first');
          break;
        case 'End':
          event.preventDefault();
          focusEdge('last');
          break;
        default:
          break;
      }
    };

    return (
      <button
        {...props}
        ref={setTriggerRef}
        id={triggerId}
        role="tab"
        type="button"
        aria-selected={isActive}
        aria-controls={panelId}
        tabIndex={isActive ? 0 : -1}
        data-state={isActive ? 'active' : 'inactive'}
        disabled={disabled}
        className={cn(
          'relative inline-flex min-w-24 items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium text-muted transition-[color,background,border,box-shadow] outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
          isActive
            ? 'border border-border bg-background text-foreground shadow-sm'
            : 'border border-transparent hover:bg-muted/70 hover:text-foreground',
          className,
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      />
    );
  },
);

export type TabsContentProps = HTMLAttributes<HTMLDivElement> & {
  value: TabsValue;
};

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  function TabsContent({ className, value, children, ...props }, ref) {
    const { value: activeValue, baseId } = useTabsContext('TabsContent');
    const isActive = activeValue === value;
    const triggerId = `${baseId}-tab-${value}`;
    const panelId = `${baseId}-panel-${value}`;

    return (
      <div
        {...props}
        ref={ref}
        id={panelId}
        role="tabpanel"
        aria-labelledby={triggerId}
        tabIndex={0}
        hidden={!isActive}
        data-state={isActive ? 'active' : 'inactive'}
        className={cn(
          'rounded-lg border border-border bg-background p-4 text-sm leading-6 text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ring-offset-background',
          !isActive && 'hidden',
          className,
        )}
      >
        {children}
      </div>
    );
  },
);
