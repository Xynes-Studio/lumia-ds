import React, {
  act,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Simulate } from 'react-dom/test-utils';
import { FontCombobox } from './FontCombobox';
import type { FontConfig } from '../../font-config';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

type PopoverContextValue = {
  open: boolean;
  setOpen: (next: boolean) => void;
};

const PopoverContext = createContext<PopoverContextValue | null>(null);

// Mock the Lumia components Combobox
vi.mock('@lumia/components', () => {
  const Popover = ({
    open,
    defaultOpen,
    onOpenChange,
    children,
  }: {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (next: boolean) => void;
    children: React.ReactNode;
  }) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
    const isControlled = open !== undefined;
    const currentOpen = isControlled ? open : internalOpen;

    const setOpen = (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    };

    const value = useMemo(
      () => ({ open: currentOpen, setOpen }),
      [currentOpen],
    );

    return (
      <PopoverContext.Provider value={value}>
        {children}
      </PopoverContext.Provider>
    );
  };

  const PopoverTrigger = ({ children }: { children: React.ReactElement }) => {
    const ctx = useContext(PopoverContext);

    return React.cloneElement(children, {
      ...children.props,
      onClick: (event: MouseEvent) => {
        children.props.onClick?.(event);
        if (ctx) {
          ctx.setOpen(!ctx.open);
        }
      },
    });
  };

  const PopoverContent = ({ children }: { children: React.ReactNode }) => {
    const ctx = useContext(PopoverContext);
    if (!ctx?.open) return null;

    return <div data-testid="combobox-popover">{children}</div>;
  };

  const Combobox = ({
    value,
    onChange,
    loadOptions,
    placeholder,
  }: {
    value: { label: string; value: string } | null;
    onChange: (option: { label: string; value: string } | null) => void;
    loadOptions: (query: string) => Promise<{ label: string; value: string }[]>;
    placeholder?: string;
  }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState(value?.label ?? '');
    const [options, setOptions] = useState<{ label: string; value: string }[]>(
      [],
    );

    const triggerLoad = (search: string) => {
      void loadOptions(search).then((result) => {
        setOptions(result);
      });
    };

    // Trigger initial load when opened
    useEffect(() => {
      if (open) {
        triggerLoad(query);
      }
    }, [open]);

    const handleFocus = () => {
      setOpen(true);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.currentTarget.value;
      setQuery(nextValue);
      setOpen(true);
      triggerLoad(nextValue);
    };

    const selectOption = (option: { label: string; value: string } | null) => {
      onChange(option);
      setOpen(false);
      setQuery(option?.label ?? '');
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <div>
          <PopoverTrigger>
            <input
              type="text"
              value={query}
              placeholder={placeholder}
              onFocus={handleFocus}
              onChange={handleInputChange}
              data-testid="font-combobox-input"
            />
          </PopoverTrigger>
          <PopoverContent>
            <div role="listbox">
              {options.length === 0 ? (
                <div>No results</div>
              ) : (
                options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={value?.value === option.value}
                    onClick={() => selectOption(option)}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </div>
      </Popover>
    );
  };

  return { Combobox };
});

const waitFor = async (
  callback: () => void | Promise<void>,
  timeout = 1000,
) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await callback();
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
  await callback();
};

describe('FontCombobox', () => {
  let root: ReturnType<typeof createRoot>;
  let host: HTMLDivElement;

  const mockConfig: FontConfig = {
    allFonts: [
      { id: 'inter', label: 'Inter', cssStack: 'Inter, sans-serif' },
      { id: 'roboto', label: 'Roboto', cssStack: 'Roboto, sans-serif' },
      { id: 'lora', label: 'Lora', cssStack: 'Lora, serif' },
      {
        id: 'roboto-mono',
        label: 'Roboto Mono',
        cssStack: 'Roboto Mono, monospace',
      },
    ],
    defaultFontId: 'inter',
  };

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it.skip('renders all fonts when allowedFonts is not set', async () => {
    const handleChange = vi.fn();

    await act(async () => {
      root.render(
        <FontCombobox
          config={mockConfig}
          value="inter"
          onChange={handleChange}
        />,
      );
    });

    const input = host.querySelector(
      '[data-testid="font-combobox-input"]',
    ) as HTMLInputElement;

    await act(async () => {
      Simulate.focus(input);
    });

    // Wait for options to appear in the DOM
    await waitFor(async () => {
      const options = document.body.querySelectorAll('[role="option"]');
      expect(options.length).toBe(4);
    });

    const options = Array.from(
      document.body.querySelectorAll('[role="option"]'),
    );
    expect(options.map((el) => el.textContent)).toEqual([
      'Inter',
      'Roboto',
      'Lora',
      'Roboto Mono',
    ]);
  });

  it.skip('filters to show only allowedFonts when provided', async () => {
    const configWithRestrictions: FontConfig = {
      ...mockConfig,
      allowedFonts: ['inter', 'roboto'],
    };
    const handleChange = vi.fn();

    await act(async () => {
      root.render(
        <FontCombobox
          config={configWithRestrictions}
          value="inter"
          onChange={handleChange}
        />,
      );
    });

    const input = host.querySelector(
      '[data-testid="font-combobox-input"]',
    ) as HTMLInputElement;

    await act(async () => {
      Simulate.focus(input);
    });

    // Wait for options to appear in the DOM
    await waitFor(async () => {
      const options = document.body.querySelectorAll('[role="option"]');
      expect(options.length).toBe(2);
    });

    const options = Array.from(
      document.body.querySelectorAll('[role="option"]'),
    );
    expect(options.map((el) => el.textContent)).toEqual(['Inter', 'Roboto']);
  });

  it('typing "inter" filters options to fonts with "inter" in the label', async () => {
    const handleChange = vi.fn();

    await act(async () => {
      root.render(
        <FontCombobox
          config={mockConfig}
          value="inter"
          onChange={handleChange}
        />,
      );
    });

    const input = host.querySelector(
      '[data-testid="font-combobox-input"]',
    ) as HTMLInputElement;

    await act(async () => {
      Simulate.focus(input);
      await Promise.resolve();
    });

    await act(async () => {
      input.value = 'inter';
      Simulate.change(input, {
        target: { value: 'inter' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    // Wait for filtered options to appear
    await waitFor(async () => {
      const options = document.body.querySelectorAll('[role="option"]');
      expect(options.length).toBe(1);
    });

    const options = Array.from(
      document.body.querySelectorAll('[role="option"]'),
    );
    expect(options[0].textContent).toBe('Inter');
  });

  it('typing "mono" filters to "Roboto Mono"', async () => {
    const handleChange = vi.fn();

    await act(async () => {
      root.render(
        <FontCombobox
          config={mockConfig}
          value="inter"
          onChange={handleChange}
        />,
      );
    });

    const input = host.querySelector(
      '[data-testid="font-combobox-input"]',
    ) as HTMLInputElement;

    await act(async () => {
      Simulate.focus(input);
      await Promise.resolve();
    });

    await act(async () => {
      input.value = 'mono';
      Simulate.change(input, {
        target: { value: 'mono' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    // Wait for filtered options to appear
    await waitFor(async () => {
      const options = document.body.querySelectorAll('[role="option"]');
      expect(options.length).toBe(1);
    });

    const options = Array.from(
      document.body.querySelectorAll('[role="option"]'),
    );
    expect(options[0].textContent).toBe('Roboto Mono');
  });

  it.skip('clicking on a font option selects it and fires onChange with correct fontId', async () => {
    const handleChange = vi.fn();

    const Harness = () => {
      const [selected, setSelected] = useState('inter');

      return (
        <FontCombobox
          config={mockConfig}
          value={selected}
          onChange={(fontId) => {
            setSelected(fontId);
            handleChange(fontId);
          }}
        />
      );
    };

    await act(async () => {
      root.render(<Harness />);
    });

    const input = host.querySelector(
      '[data-testid="font-combobox-input"]',
    ) as HTMLInputElement;

    await act(async () => {
      Simulate.focus(input);
    });

    // Wait for options to appear
    await waitFor(async () => {
      const options = document.body.querySelectorAll('[role="option"]');
      expect(options.length).toBeGreaterThan(1);
    });

    const options = Array.from(
      document.body.querySelectorAll('[role="option"]'),
    ) as HTMLButtonElement[];

    await act(async () => {
      Simulate.click(options[1]); // Click "Roboto"
      await Promise.resolve();
    });

    expect(handleChange).toHaveBeenCalledWith('roboto');
  });

  it('displays the selected font label in the input', async () => {
    const handleChange = vi.fn();

    await act(async () => {
      root.render(
        <FontCombobox
          config={mockConfig}
          value="lora"
          onChange={handleChange}
        />,
      );
    });

    const input = host.querySelector(
      '[data-testid="font-combobox-input"]',
    ) as HTMLInputElement;

    expect(input.value).toBe('Lora');
  });
});
