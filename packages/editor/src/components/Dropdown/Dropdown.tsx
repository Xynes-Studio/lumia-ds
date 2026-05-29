import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@lumia-ui/components';

/**
 * A single selectable option for the {@link Dropdown}.
 */
export interface DropdownOption {
  /** Stable value emitted through `onChange`. */
  value: string;
  /** Human-readable, translation-ready label rendered to the user. */
  label: string;
}

export interface DropdownProps {
  /** Currently selected option value. */
  value: string;
  /** Fired with the newly selected option value. */
  onChange: (value: string) => void;
  /** The options to render in the listbox. */
  options: DropdownOption[];
  /** Optional visible field label (rendered above the trigger). */
  label?: string;
  /** Placeholder shown when no option matches `value`. */
  placeholder?: string;
  /** Disable the control. */
  disabled?: boolean;
  /** Extra classes for the trigger. */
  className?: string;
  /** Explicit id for the trigger (used to associate the label). */
  id?: string;
  /**
   * Accessible name when there is no visible `label` (e.g. a toolbar control).
   * Mirrors the native `aria-label` contract of the element it replaces.
   */
  'aria-label'?: string;
}

const triggerClasses =
  'flex w-full items-center justify-between gap-2 rounded-md border border-border ' +
  'bg-background px-3 py-2 text-sm text-foreground cursor-pointer ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ' +
  'focus-visible:ring-offset-2 ring-offset-background ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

const optionClasses =
  'flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left ' +
  'text-sm text-foreground cursor-pointer select-none outline-none ' +
  'hover:bg-muted focus:bg-muted aria-selected:font-medium';

/**
 * Dropdown — a select-only combobox built on the Lumia DS `Popover` primitive.
 *
 * Replaces native single-select form controls inside the editor (toolbar
 * block-type picker and the block inspectors). Renders an ARIA select-only
 * combobox:
 * a `role="combobox"` trigger (`data-lumia-component="dropdown"`) that toggles
 * a `role="listbox"` popup of `role="option"` items, with full keyboard
 * support. Product copy is supplied by the consumer through `options` /
 * `label` / `aria-label`, keeping the primitive translation-ready.
 */
export function Dropdown({
  value,
  onChange,
  options,
  label,
  placeholder = 'Select…',
  disabled = false,
  className,
  id,
  'aria-label': ariaLabel,
}: DropdownProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const listboxId = `${controlId}-listbox`;
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;

  const openMenu = () => {
    if (disabled) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };

  const closeMenu = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  const commitSelection = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    closeMenu();
  };

  // Move DOM focus to the active option while the listbox is open so keyboard
  // users land on (and can arrow through) the options.
  useEffect(() => {
    if (open && activeIndex >= 0) {
      optionRefs.current[activeIndex]?.focus();
    }
  }, [open, activeIndex]);

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || open) return;
    if (
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp' ||
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();
      openMenu();
    }
  };

  const handleListboxKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((index) => Math.min(options.length - 1, index + 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((index) => Math.max(0, index - 1));
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        commitSelection(activeIndex);
        break;
      case 'Escape':
        event.preventDefault();
        closeMenu();
        break;
      case 'Tab':
        closeMenu();
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label
          htmlFor={controlId}
          className="text-sm font-medium leading-5 text-foreground"
        >
          {label}
        </label>
      ) : null}
      <Popover
        open={open}
        onOpenChange={(next) => (next ? openMenu() : closeMenu())}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            id={controlId}
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={open ? listboxId : undefined}
            aria-label={ariaLabel}
            data-lumia-component="dropdown"
            disabled={disabled}
            onKeyDown={handleTriggerKeyDown}
            className={`${triggerClasses}${className ? ` ${className}` : ''}`}
          >
            <span
              className={selectedOption ? undefined : 'text-muted-foreground'}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-muted-foreground"
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(event) => event.preventDefault()}
          className="min-w-[var(--radix-popover-trigger-width)] max-w-[16rem] p-1"
        >
          <div
            role="listbox"
            id={listboxId}
            aria-label={ariaLabel ?? label}
            onKeyDown={handleListboxKeyDown}
            className="flex flex-col gap-0.5"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={index === activeIndex ? 0 : -1}
                  ref={(element) => {
                    optionRefs.current[index] = element;
                  }}
                  onClick={() => commitSelection(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={optionClasses}
                >
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
