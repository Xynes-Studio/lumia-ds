import React, {
  act,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Simulate } from 'react-dom/test-utils';
import { FontCombobox, type FontItem } from './font-combobox';

import { vi } from 'vitest';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

type PopoverContextValue = {
  open: boolean;
  setOpen: (next: boolean) => void;
};

const PopoverContext = createContext<PopoverContextValue | null>(null);

// Mock the popover module - define inline to avoid hoisting issues
vi.mock('../popover/popover', () => {
  return {
    Popover: ({
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
    },
    PopoverTrigger: ({ children }: { children: React.ReactElement }) => {
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
    },
    PopoverContent: ({ children }: { children: React.ReactNode }) => {
      const ctx = useContext(PopoverContext);
      if (!ctx?.open) return null;

      return <div data-testid="combobox-popover">{children}</div>;
    },
  };
});

const mockFonts: FontItem[] = [
  { id: 'roboto', label: 'Roboto', category: 'sans' },
  { id: 'roboto-mono', label: 'Roboto Mono', category: 'mono' },
  { id: 'open-sans', label: 'Open Sans', category: 'sans' },
  { id: 'lora', label: 'Lora', category: 'serif' },
  { id: 'montserrat', label: 'Montserrat', category: 'sans' },
  { id: 'source-code-pro', label: 'Source Code Pro', category: 'mono' },
];

describe('FontCombobox', () => {
  let root: ReturnType<typeof createRoot>;
  let host: HTMLDivElement;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('filters fonts list when typing', async () => {
    await act(async () => {
      root.render(
        <FontCombobox
          fonts={mockFonts}
          value={null}
          onChange={() => {}}
          placeholder="Select a font"
        />,
      );
    });

    const input = host.querySelector('input') as HTMLInputElement;

    // Focus the input to open the dropdown
    await act(async () => {
      Simulate.focus(input);
      await Promise.resolve();
    });

    // Initially, all fonts should be available
    let options = Array.from(
      document.body.querySelectorAll('[role="option"]'),
    ) as HTMLElement[];
    expect(options.length).toBe(6);

    // Type "rob" to filter
    await act(async () => {
      input.value = 'rob';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Simulate.change(input, { target: { value: 'rob' } as any });
      await Promise.resolve();
    });

    // Should only show fonts containing "rob" (Roboto and Roboto Mono)
    options = Array.from(
      document.body.querySelectorAll('[role="option"]'),
    ) as HTMLElement[];
    expect(options.length).toBe(2);
    expect(options.map((opt) => opt.textContent?.trim())).toEqual([
      'Roboto',
      'Roboto Mono',
    ]);
  });

  it('filters fonts case-insensitively', async () => {
    await act(async () => {
      root.render(
        <FontCombobox fonts={mockFonts} value={null} onChange={() => {}} />,
      );
    });

    const input = host.querySelector('input') as HTMLInputElement;

    await act(async () => {
      Simulate.focus(input);
      await Promise.resolve();
    });

    // Type "LORA" in uppercase
    await act(async () => {
      input.value = 'LORA';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Simulate.change(input, { target: { value: 'LORA' } as any });
      await Promise.resolve();
    });

    const options = Array.from(
      document.body.querySelectorAll('[role="option"]'),
    ) as HTMLElement[];
    expect(options.length).toBe(1);
    expect(options[0].textContent?.trim()).toBe('Lora');
  });

  it('triggers onChange with correct font id when selecting a font', async () => {
    const handleChange = vi.fn();

    const Harness = () => {
      const [selected, setSelected] = useState<string | null>(null);

      return (
        <FontCombobox
          fonts={mockFonts}
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

    const input = host.querySelector('input') as HTMLInputElement;

    await act(async () => {
      Simulate.focus(input);
      await Promise.resolve();
    });

    const options = Array.from(
      document.body.querySelectorAll('[role="option"]'),
    ) as HTMLButtonElement[];

    // Click on "Lora"
    const loraOption = options.find(
      (opt) => opt.textContent?.trim() === 'Lora',
    );
    expect(loraOption).toBeDefined();

    await act(async () => {
      Simulate.click(loraOption!);
      await Promise.resolve();
    });

    expect(handleChange).toHaveBeenCalledWith('lora');
  });

  it('displays the correct font label when value prop is set', async () => {
    await act(async () => {
      root.render(
        <FontCombobox
          fonts={mockFonts}
          value="montserrat"
          onChange={() => {}}
        />,
      );
    });

    const input = host.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('Montserrat');
  });

  it('updates display when value prop changes', async () => {
    const Harness = () => {
      const [selected, setSelected] = useState<string | null>('roboto');

      return (
        <div>
          <FontCombobox
            fonts={mockFonts}
            value={selected}
            onChange={setSelected}
          />
          <button onClick={() => setSelected('lora')}>Select Lora</button>
        </div>
      );
    };

    await act(async () => {
      root.render(<Harness />);
    });

    let input = host.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('Roboto');

    const button = host.querySelector('button') as HTMLButtonElement;
    await act(async () => {
      Simulate.click(button);
      await Promise.resolve();
    });

    input = host.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('Lora');
  });

  it('shows "No results" when filter matches no fonts', async () => {
    await act(async () => {
      root.render(
        <FontCombobox fonts={mockFonts} value={null} onChange={() => {}} />,
      );
    });

    const input = host.querySelector('input') as HTMLInputElement;

    await act(async () => {
      Simulate.focus(input);
      await Promise.resolve();
    });

    // Type something that matches no fonts
    await act(async () => {
      input.value = 'xyzabc123';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Simulate.change(input, { target: { value: 'xyzabc123' } as any });
      await Promise.resolve();
    });

    expect(document.body.textContent?.includes('No results')).toBe(true);
  });
});
