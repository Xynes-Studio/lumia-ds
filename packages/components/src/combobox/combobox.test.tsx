import React, {
  act,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Simulate } from 'react-dom/test-utils';
import { Combobox, MultiSelect, type ComboboxOption } from './combobox';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

type PopoverContextValue = {
  open: boolean;
  setOpen: (next: boolean) => void;
};

const PopoverContext = createContext<PopoverContextValue | null>(null);

vi.mock('./popover', () => {
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

  return { Popover, PopoverContent, PopoverTrigger };
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

describe('Combobox', () => {
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

  it('loads options on focus and while typing', async () => {
    const loadOptions = vi.fn().mockResolvedValue([]);

    await act(async () => {
      root.render(
        <Combobox
          value={null}
          onChange={() => {}}
          loadOptions={loadOptions}
          placeholder="Pick a value"
        />,
      );
    });

    const input = host.querySelector('input') as HTMLInputElement;

    await act(async () => {
      Simulate.focus(input);
      await Promise.resolve();
    });

    expect(loadOptions).toHaveBeenCalledWith('');

    await act(async () => {
      input.value = 'alp';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Simulate.change(input, { target: { value: 'alp' } as any });
      await Promise.resolve();
    });

    expect(input.value).toBe('alp');
    expect(loadOptions).toHaveBeenLastCalledWith('alp');
  });

  it('navigates options with arrows and selects with Enter', async () => {
    const loadOptions = vi.fn().mockResolvedValue([
      { label: 'Alpha', value: 'alpha' },
      { label: 'Beta', value: 'beta' },
    ]);
    const handleChange = vi.fn();

    const Harness = () => {
      const [selected, setSelected] = useState<ComboboxOption | null>(null);

      return (
        <Combobox
          value={selected}
          onChange={(option) => {
            setSelected(option);
            handleChange(option);
          }}
          loadOptions={loadOptions}
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

    const listbox = document.body.querySelector('[role="listbox"]');
    expect(listbox).toBeTruthy();
    expect(
      Array.from(document.body.querySelectorAll('[role="option"]')).map(
        (node) => node.textContent,
      ),
    ).toEqual(['Alpha', 'Beta']);

    await act(async () => {
      Simulate.keyDown(input, { key: 'ArrowDown' });
      await Promise.resolve();
    });
    await act(async () => {
      Simulate.keyDown(input, { key: 'Enter' });
      await Promise.resolve();
    });
    await act(async () => {});

    expect(handleChange).toHaveBeenCalledWith({
      label: 'Beta',
      value: 'beta',
    });
    expect(host.querySelector('input')?.value).toBe('Beta');
    await waitFor(() => {
      expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    });
  });

  it('shows loading and empty states', async () => {
    let resolveOptions: (() => void) | null = null;
    const loadOptions = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveOptions = () => resolve([]);
        }),
    );

    await act(async () => {
      root.render(
        <Combobox value={null} onChange={() => {}} loadOptions={loadOptions} />,
      );
    });

    const input = host.querySelector('input') as HTMLInputElement;
    await act(async () => {
      Simulate.focus(input);
      await Promise.resolve();
    });

    expect(
      document.body.textContent?.includes('Loading options...'),
    ).toBeTruthy();

    await act(async () => {
      resolveOptions?.();
    });
    await act(async () => {});

    expect(document.body.textContent?.includes('No results')).toBe(true);
  });

  it('does not close when clicking immediately after focus (simulating user click)', async () => {
    const loadOptions = vi.fn().mockResolvedValue([]);
    await act(async () => {
      root.render(
        <Combobox value={null} onChange={() => {}} loadOptions={loadOptions} />,
      );
    });

    const input = host.querySelector('input') as HTMLInputElement;

    // User click sequence: PointerDown -> Focus -> PointerUp -> Click
    await act(async () => {
      Simulate.pointerDown(input);
      Simulate.focus(input);
      Simulate.pointerUp(input);
      Simulate.click(input);
    });
    // In buggy implementation with race condition, this might toggle it CLOSED.

    // We want it to be OPEN.
    expect(document.body.querySelector('[role="listbox"]')).toBeTruthy();
  });
  it('reopens the popover and loads options when clicking input after selection', async () => {
    const loadOptions = vi.fn().mockResolvedValue([
      { label: 'Alpha', value: 'alpha' },
      { label: 'Beta', value: 'beta' },
    ]);
    const handleChange = vi.fn();

    const Harness = () => {
      const [selected, setSelected] = useState<ComboboxOption | null>(null);
      return (
        <Combobox
          value={selected}
          onChange={(val) => {
            setSelected(val);
            handleChange(val);
          }}
          loadOptions={loadOptions}
        />
      );
    };

    await act(async () => {
      root.render(<Harness />);
    });

    const input = host.querySelector('input') as HTMLInputElement;

    // 1. Open and Select 'Alpha'
    await act(async () => {
      Simulate.focus(input);
      await Promise.resolve();
    });
    // Wait for options to load
    await act(async () => {
      await Promise.resolve();
    });

    const options = document.body.querySelectorAll('[role="option"]');
    await act(async () => {
      Simulate.click(options[0]); // Select Alpha
      await Promise.resolve();
    });

    expect(handleChange).toHaveBeenCalledWith({
      label: 'Alpha',
      value: 'alpha',
    });
    // Should be closed
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();

    // 2. Click input again to re-open
    // Note: In a real browser, clicking a focused input doesn't necessarily fire focus again,
    // but the PopoverTrigger handles click events to toggle.
    // We simulate a click on the input (which is inside the trigger).
    // The PopoverTrigger logic in our mock/implementation toggles open state.
    await act(async () => {
      Simulate.click(input);
      await Promise.resolve();
    });

    // Should be open again
    expect(document.body.querySelector('[role="listbox"]')).toBeTruthy();

    // CRITICAL: loadOptions should be called again with the CURRENT query (which is 'Alpha')
    // The count will be:
    // 1. Initial focus ('')
    // 2. Selection closes it.
    // 3. Re-open click ('Alpha')
    expect(loadOptions).toHaveBeenLastCalledWith('Alpha');
  });
});

describe('MultiSelect', () => {
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

  it('loads options, toggles selections, and shows chips', async () => {
    const loadOptions = vi.fn().mockResolvedValue([
      { label: 'Alpha', value: 'alpha' },
      { label: 'Beta', value: 'beta' },
      { label: 'Gamma', value: 'gamma' },
    ]);
    const handleChange = vi.fn();

    const Harness = () => {
      const [selected, setSelected] = useState<ComboboxOption[]>([]);

      return (
        <MultiSelect
          value={selected}
          onChange={(options) => {
            setSelected(options);
            handleChange(options);
          }}
          loadOptions={loadOptions}
          placeholder="Pick multiple"
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

    expect(loadOptions).toHaveBeenCalledWith('');

    await act(async () => {
      input.value = 'al';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Simulate.change(input, { target: { value: 'al' } as any });
      await Promise.resolve();
    });

    expect(loadOptions).toHaveBeenLastCalledWith('al');

    const options = Array.from(
      document.body.querySelectorAll('[role="option"]'),
    ) as HTMLButtonElement[];
    expect(options.map((node) => node.textContent?.trim())).toEqual([
      'Alpha',
      'Beta',
      'Gamma',
    ]);

    await act(async () => {
      Simulate.click(options[0]);
      await Promise.resolve();
    });

    expect(handleChange).toHaveBeenLastCalledWith([
      { label: 'Alpha', value: 'alpha' },
    ]);
    expect(
      Array.from(host.querySelectorAll('button[aria-label^="Remove"]')).map(
        (node) => node.getAttribute('aria-label'),
      ),
    ).toContain('Remove tag Alpha');
    expect(options[0].getAttribute('aria-selected')).toBe('true');

    await act(async () => {
      Simulate.click(options[1]);
      await Promise.resolve();
    });

    expect(handleChange).toHaveBeenLastCalledWith([
      { label: 'Alpha', value: 'alpha' },
      { label: 'Beta', value: 'beta' },
    ]);

    const removeAlpha = host.querySelector(
      'button[aria-label="Remove tag Alpha"]',
    ) as HTMLButtonElement;

    await act(async () => {
      Simulate.click(removeAlpha);
      await Promise.resolve();
    });

    expect(handleChange).toHaveBeenLastCalledWith([
      { label: 'Beta', value: 'beta' },
    ]);
  });

  it('removes the last chip with backspace when the input is empty', async () => {
    const loadOptions = vi.fn().mockResolvedValue([]);
    const handleChange = vi.fn();

    const Harness = () => {
      const [selected, setSelected] = useState<ComboboxOption[]>([
        { label: 'Alpha', value: 'alpha' },
        { label: 'Beta', value: 'beta' },
      ]);

      return (
        <MultiSelect
          value={selected}
          onChange={(options) => {
            setSelected(options);
            handleChange(options);
          }}
          loadOptions={loadOptions}
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

    await act(async () => {
      Simulate.keyDown(input, { key: 'Backspace' });
      await Promise.resolve();
    });

    expect(handleChange).toHaveBeenLastCalledWith([
      { label: 'Alpha', value: 'alpha' },
    ]);

    await act(async () => {
      Simulate.keyDown(input, { key: 'Backspace' });
      await Promise.resolve();
    });

    expect(handleChange).toHaveBeenLastCalledWith([]);
  });
});
