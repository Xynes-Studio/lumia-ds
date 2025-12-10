import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import { Button } from './button';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('Button component', () => {
  it('renders with default props', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<Button>Click</Button>);
    });

    const button = host.querySelector('button');
    expect(button?.textContent).toBe('Click');
    expect(button?.getAttribute('type')).toBe('button');
    expect(button?.className).toContain('bg-primary');
    expect(button?.className).toContain('rounded-md');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('applies variants, sizes, and layout props', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Button variant="secondary" size="lg" fullWidth>
          Wide Secondary
        </Button>,
      );
    });

    const button = host.querySelector('button');
    expect(button?.className).toContain('bg-secondary');
    expect(button?.className).toContain('h-11');
    expect(button?.className).toContain('w-full');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
  it('handles click events and disabled state', async () => {
    const { root, host } = createTestRoot();
    const handleClick = vi.fn();

    await act(async () => {
      root.render(<Button onClick={handleClick}>Click</Button>);
    });

    const button = host.querySelector('button');

    // Click enabled
    await act(async () => {
      button?.click();
    });
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Disable
    await act(async () => {
      root.render(
        <Button onClick={handleClick} disabled>
          Click
        </Button>,
      );
    });

    const disabledButton = host.querySelector('button');
    expect(disabledButton?.hasAttribute('disabled')).toBe(true);

    // Click disabled
    await act(async () => {
      disabledButton?.click();
    });
    expect(handleClick).toHaveBeenCalledTimes(1);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('renders with correct type attribute', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<Button type="submit">Submit</Button>);
    });
    const button = host.querySelector('button');
    expect(button?.getAttribute('type')).toBe('submit');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('renders loading state correctly', async () => {
    const { root, host } = createTestRoot();

    // Test basic loading state
    await act(async () => {
      root.render(<Button isLoading>Click me</Button>);
    });

    const button = host.querySelector('button');
    expect(button).toBeTruthy();
    expect(button?.disabled).toBe(true);
    // Check for spinner - aria-label default is "Loading"
    const spinner = button?.querySelector('[role="status"]');
    expect(spinner).toBeTruthy();
    expect(spinner?.getAttribute('aria-label')).toBe('Loading');
    expect(button?.textContent).toBe('LoadingClick me'); // Spinner hidden text + children
    // Usually loading state replaces content or adds spinner. Let's assume adds for now or check design.
    // Actually, usually we want to keep width or just show spinner.
    // Let's implement it such that it shows spinner AND text or just spinner if text is hidden.
    // For now, let's just assert spinner presence.
  });

  it('renders loading text when provided', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Button isLoading loadingText="Processing...">
          Submit
        </Button>,
      );
    });

    const button = host.querySelector('button');
    expect(button?.disabled).toBe(true);
    expect(button?.textContent).toContain('Processing...');
    // Should still have spinner
    expect(button?.querySelector('[role="status"]')).toBeTruthy();
  });

  it('does not trigger click when loading', async () => {
    const { root, host } = createTestRoot();
    const handleClick = vi.fn();

    await act(async () => {
      root.render(
        <Button onClick={handleClick} isLoading>
          Click
        </Button>,
      );
    });

    const button = host.querySelector('button');
    expect(button?.disabled).toBe(true);

    await act(async () => {
      button?.click();
    });

    expect(handleClick).not.toHaveBeenCalled();

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('preserves layout when loading without text', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<Button isLoading>Content</Button>);
    });

    const button = host.querySelector('button');
    expect(button?.className).toContain('relative');
    // expect(button?.className).toContain('text-transparent'); // No longer using text-transparent

    // Check for invisible content wrapper
    // Since we use display: contents, the span might not be easily queryable if it disappears from accessibility tree?
    // But it exists in DOM.
    // However, vitest/jsdom might handle it.
    // Let's query based on class.
    const wrapper = button?.querySelector('.invisible.contents');
    expect(wrapper).toBeTruthy();
    expect(wrapper?.textContent).toBe('Content');

    const spinner = host.querySelector('[data-loading-spinner]');
    expect(spinner).toBeTruthy();
    expect(spinner?.className).toContain('absolute');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
