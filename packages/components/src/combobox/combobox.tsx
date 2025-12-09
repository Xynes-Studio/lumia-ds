import type { ChangeEvent, InputHTMLAttributes, KeyboardEvent } from 'react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../popover/popover';
import { Spinner } from '../spinner/spinner';
import { Tag } from '../tag/tag';
import { baseFieldClasses } from '../shared/field';
import { cn } from '../lib/utils';

export type ComboboxOption = {
  label: string;
  value: string;
};

export type ComboboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> & {
  value: ComboboxOption | null;
  onChange: (option: ComboboxOption | null) => void;
  loadOptions: (input: string) => Promise<ComboboxOption[]>;
  placeholder?: string;
};

export type MultiSelectProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> & {
  value: ComboboxOption[];
  onChange: (options: ComboboxOption[]) => void;
  loadOptions: (input: string) => Promise<ComboboxOption[]>;
  placeholder?: string;
};

export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(
  function Combobox(
    {
      value,
      onChange,
      loadOptions,
      placeholder = 'Search...',
      className,
      disabled,
      ...inputProps
    },
    ref,
  ) {
    const listId = useId();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const requestIdRef = useRef(0);
    const isPointerDownRef = useRef(false);
    const ignoreFocusRef = useRef(false);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState(value?.label ?? '');
    const [options, setOptions] = useState<ComboboxOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [contentWidth, setContentWidth] = useState<number>();

    const mergedRef = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;

        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    const resetQueryToValue = useCallback(() => {
      setQuery(value?.label ?? '');
    }, [value]);

    useEffect(() => {
      if (!open) {
        resetQueryToValue();
      }
    }, [open, resetQueryToValue, value]);

    const getNextHighlightIndex = useCallback(
      (items: ComboboxOption[]) => {
        if (items.length === 0) return -1;
        if (!value) return 0;

        const matchIndex = items.findIndex(
          (item) => item.value === value.value,
        );

        return matchIndex >= 0 ? matchIndex : 0;
      },
      [value],
    );

    const triggerLoad = useCallback(
      (search: string) => {
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;
        setLoading(true);

        void loadOptions(search)
          .then((result) => {
            if (requestIdRef.current !== requestId) return;

            setOptions(result);
            setHighlightedIndex(getNextHighlightIndex(result));
          })
          .catch(() => {
            if (requestIdRef.current !== requestId) return;

            setOptions([]);
            setHighlightedIndex(-1);
          })
          .finally(() => {
            if (requestIdRef.current === requestId) {
              setLoading(false);
            }
          });
      },
      [getNextHighlightIndex, loadOptions],
    );

    const updateContentWidth = useCallback(() => {
      if (!inputRef.current) return;

      setContentWidth(inputRef.current.getBoundingClientRect().width);
    }, []);

    const handleOpenChange = (nextOpen: boolean) => {
      if (disabled) return;

      setOpen(nextOpen);

      if (!nextOpen) {
        setHighlightedIndex(-1);
        resetQueryToValue();
      } else {
        updateContentWidth();
        triggerLoad(query);
      }
    };

    const handleFocus = () => {
      if (disabled) return;

      updateContentWidth();

      if (ignoreFocusRef.current) {
        ignoreFocusRef.current = false;
        return;
      }

      if (!isPointerDownRef.current) {
        setOpen(true);
      }
      triggerLoad(query);
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.currentTarget.value;
      setQuery(nextValue);
      setOpen(true);
      triggerLoad(nextValue);
    };

    const selectOption = (option: ComboboxOption | null) => {
      ignoreFocusRef.current = true;
      onChange(option);
      setOpen(false);
      setHighlightedIndex(-1);
      setQuery(option?.label ?? '');
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();

        if (!open) {
          setOpen(true);
          triggerLoad(query);
          return;
        }

        if (options.length === 0) return;

        setHighlightedIndex((currentIndex) => {
          const direction = event.key === 'ArrowDown' ? 1 : -1;
          if (currentIndex === -1) {
            return direction === 1 ? 0 : options.length - 1;
          }

          const nextIndex =
            (currentIndex + direction + options.length) % options.length;
          return nextIndex;
        });
        return;
      }

      if (event.key === 'Enter') {
        if (open && highlightedIndex >= 0) {
          event.preventDefault();
          const option = options[highlightedIndex];
          if (option) {
            selectOption(option);
          }
        }
        return;
      }

      if (event.key === 'Escape' && open) {
        event.preventDefault();
        setOpen(false);
        setHighlightedIndex(-1);
        resetQueryToValue();
      }
    };

    const activeDescendant = useMemo(() => {
      if (!open || highlightedIndex < 0) return undefined;
      return `${listId}-option-${highlightedIndex}`;
    }, [highlightedIndex, listId, open]);

    return (
      <Popover open={open} onOpenChange={handleOpenChange}>
        <div className="relative w-full">
          <PopoverTrigger asChild>
            <input
              ref={mergedRef}
              role="combobox"
              aria-expanded={open}
              aria-controls={open ? listId : undefined}
              aria-activedescendant={activeDescendant}
              aria-autocomplete="list"
              autoComplete="off"
              type="text"
              disabled={disabled}
              value={query}
              placeholder={placeholder}
              className={cn(baseFieldClasses, 'pr-9 bg-background', className)}
              onFocus={handleFocus}
              onPointerDown={() => {
                isPointerDownRef.current = true;
              }}
              onPointerUp={() => {
                isPointerDownRef.current = false;
              }}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              {...inputProps}
            />
          </PopoverTrigger>
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground ">
            {loading ? (
              <Spinner size="sm" aria-label="Loading options" />
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  d="M6 8l4 4 4-4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
        </div>
        <PopoverContent
          sideOffset={4}
          className="w-[min(320px,90vw)] p-1"
          onOpenAutoFocus={(event) => event.preventDefault()}
          style={
            contentWidth
              ? { width: contentWidth, minWidth: contentWidth }
              : undefined
          }
        >
          <div
            id={listId}
            role="listbox"
            aria-label="Available options"
            className="max-h-60 overflow-y-auto rounded-md border border-border bg-background shadow-sm"
          >
            {loading ? (
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                <Spinner size="sm" aria-label="Loading options" />
                <span>Loading options...</span>
              </div>
            ) : null}
            {!loading && options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No results
              </div>
            ) : null}
            {!loading
              ? options.map((option, index) => {
                const isSelected = value?.value === option.value;
                const isActive = highlightedIndex === index;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    id={`${listId}-option-${index}`}
                    aria-selected={isSelected}
                    className={cn(
                      'flex w-full cursor-pointer select-none items-center justify-between rounded-none px-3 py-2 text-left text-sm transition-colors',
                      isActive && 'bg-muted text-foreground',
                      !isActive && 'text-foreground hover:bg-muted',
                      isSelected && 'font-semibold',
                    )}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectOption(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected ? (
                      <span
                        aria-hidden="true"
                        className="text-primary-600 dark:text-primary-500"
                      >
                        •
                      </span>
                    ) : null}
                  </button>
                );
              })
              : null}
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);

export const MultiSelect = forwardRef<HTMLInputElement, MultiSelectProps>(
  function MultiSelect(
    {
      value,
      onChange,
      loadOptions,
      placeholder = 'Search...',
      className,
      disabled,
      ...inputProps
    },
    ref,
  ) {
    const listId = useId();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const triggerRef = useRef<HTMLDivElement | null>(null);
    const requestIdRef = useRef(0);
    const isPointerDownRef = useRef(false);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState<ComboboxOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [contentWidth, setContentWidth] = useState<number>();

    const mergedRef = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;

        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    const selectedValues = useMemo(
      () => new Set(value.map((option) => option.value)),
      [value],
    );

    const triggerLoad = useCallback(
      (search: string) => {
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;
        setLoading(true);

        void loadOptions(search)
          .then((result) => {
            if (requestIdRef.current !== requestId) return;

            setOptions(result);
            setHighlightedIndex(result.length > 0 ? 0 : -1);
          })
          .catch(() => {
            if (requestIdRef.current !== requestId) return;

            setOptions([]);
            setHighlightedIndex(-1);
          })
          .finally(() => {
            if (requestIdRef.current === requestId) {
              setLoading(false);
            }
          });
      },
      [loadOptions],
    );

    const updateContentWidth = useCallback(() => {
      if (!triggerRef.current) return;

      setContentWidth(triggerRef.current.getBoundingClientRect().width);
    }, []);

    const handleOpenChange = (nextOpen: boolean) => {
      if (disabled) return;

      setOpen(nextOpen);

      if (!nextOpen) {
        setHighlightedIndex(-1);
        setQuery('');
      } else {
        updateContentWidth();
      }
    };

    const handleFocus = () => {
      if (disabled) return;

      updateContentWidth();
      if (!isPointerDownRef.current) {
        setOpen(true);
      }
      triggerLoad(query);
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.currentTarget.value;
      setQuery(nextValue);
      setOpen(true);
      triggerLoad(nextValue);
    };

    const toggleOption = (option: ComboboxOption) => {
      const exists = selectedValues.has(option.value);
      const nextValue = exists
        ? value.filter((item) => item.value !== option.value)
        : [...value, option];

      onChange(nextValue);
      setHighlightedIndex((current) => {
        if (current === -1) return current;
        const optionIndex = options.findIndex(
          (item) => item.value === option.value,
        );
        return optionIndex >= 0 ? optionIndex : current;
      });
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Backspace' && query === '' && value.length > 0) {
        event.preventDefault();
        const nextValue = value.slice(0, -1);
        onChange(nextValue);
        return;
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();

        if (!open) {
          setOpen(true);
          triggerLoad(query);
          return;
        }

        if (options.length === 0) return;

        setHighlightedIndex((currentIndex) => {
          const direction = event.key === 'ArrowDown' ? 1 : -1;
          if (currentIndex === -1) {
            return direction === 1 ? 0 : options.length - 1;
          }

          const nextIndex =
            (currentIndex + direction + options.length) % options.length;
          return nextIndex;
        });
        return;
      }

      if (event.key === 'Enter') {
        if (open && highlightedIndex >= 0) {
          event.preventDefault();
          const option = options[highlightedIndex];
          if (option) {
            toggleOption(option);
          }
        }
        return;
      }

      if (event.key === 'Escape' && open) {
        event.preventDefault();
        setOpen(false);
        setHighlightedIndex(-1);
        setQuery('');
      }
    };

    const activeDescendant = useMemo(() => {
      if (!open || highlightedIndex < 0) return undefined;
      return `${listId}-option-${highlightedIndex}`;
    }, [highlightedIndex, listId, open]);

    return (
      <Popover open={open} onOpenChange={handleOpenChange}>
        <div className="relative w-full">
          <PopoverTrigger asChild>
            <div
              ref={triggerRef}
              className={cn(
                baseFieldClasses,
                'flex min-h-10 cursor-text flex-wrap items-center gap-1 pr-9 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 focus-within:ring-offset-background bg-background',
                disabled && 'cursor-not-allowed opacity-50',
                className,
              )}
              onPointerDown={() => {
                isPointerDownRef.current = true;
              }}
              onPointerUp={() => {
                isPointerDownRef.current = false;
              }}
              onClick={() => {
                if (disabled) return;
                inputRef.current?.focus();
              }}
            >
              {value.map((option) => (
                <Tag
                  key={option.value}
                  label={option.label}
                  onRemove={
                    disabled
                      ? undefined
                      : () =>
                        onChange(
                          value.filter(
                            (selected) => selected.value !== option.value,
                          ),
                        )
                  }
                />
              ))}
              <input
                ref={mergedRef}
                role="combobox"
                aria-expanded={open}
                aria-controls={open ? listId : undefined}
                aria-activedescendant={activeDescendant}
                aria-autocomplete="list"
                autoComplete="off"
                type="text"
                disabled={disabled}
                value={query}
                placeholder={value.length === 0 ? placeholder : undefined}
                className="flex-1 min-w-[96px] bg-transparent p-0 text-sm text-foreground placeholder:text-muted-foreground  focus-visible:outline-none"
                onFocus={handleFocus}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                {...inputProps}
              />
            </div>
          </PopoverTrigger>
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground ">
            {loading ? (
              <Spinner size="sm" aria-label="Loading options" />
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  d="M6 8l4 4 4-4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
        </div>
        <PopoverContent
          sideOffset={4}
          className="w-[min(320px,90vw)] p-1"
          onOpenAutoFocus={(event) => event.preventDefault()}
          style={
            contentWidth
              ? { width: contentWidth, minWidth: contentWidth }
              : undefined
          }
        >
          <div
            id={listId}
            role="listbox"
            aria-label="Available options"
            aria-multiselectable="true"
            className="max-h-60 overflow-y-auto rounded-md border border-border bg-background shadow-sm"
          >
            {loading ? (
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                <Spinner size="sm" aria-label="Loading options" />
                <span>Loading options...</span>
              </div>
            ) : null}
            {!loading && options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No results
              </div>
            ) : null}
            {!loading
              ? options.map((option, index) => {
                const isSelected = selectedValues.has(option.value);
                const isActive = highlightedIndex === index;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    id={`${listId}-option-${index}`}
                    aria-selected={isSelected}
                    className={cn(
                      'flex w-full cursor-pointer select-none items-center justify-between rounded-none px-3 py-2 text-left text-sm transition-colors',
                      isActive && 'bg-muted text-foreground',
                      !isActive && 'text-foreground hover:bg-muted',
                      isSelected && 'font-semibold',
                    )}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => toggleOption(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span
                        aria-hidden="true"
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded border border-input',
                          isSelected &&
                          'border-primary-500 bg-primary-50 text-primary-600 dark:border-primary-500/80 dark:bg-primary-500/10 dark:text-primary-400',
                        )}
                      >
                        {isSelected ? (
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 16 16"
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              d="M3.5 8l3 3 6-6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : null}
                      </span>
                      <span className="truncate">{option.label}</span>
                    </span>
                  </button>
                );
              })
              : null}
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);
