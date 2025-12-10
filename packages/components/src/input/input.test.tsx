import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { createRoot } from 'react-dom/client';
import { Input, Textarea } from './input';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('Input component', () => {
  it('renders with helper text and default styles', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<Input placeholder="Name" hint="Helper text" />);
    });

    const input = host.querySelector('input');
    const hint = host.querySelector('p');

    expect(input?.getAttribute('placeholder')).toBe('Name');
    expect(input?.getAttribute('aria-invalid')).toBeNull();
    expect(input?.className).toContain('border-border');
    expect(input?.className).toContain('focus-visible:ring-primary-500');
    expect(input?.getAttribute('aria-describedby')).toBe(hint?.id);
    expect(hint?.textContent).toBe('Helper text');
    expect(hint?.className).toContain('text-muted-foreground');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('applies invalid state and combines describedby ids', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Input
          invalid
          hint="This field is required"
          aria-describedby="existing"
        />,
      );
    });

    const input = host.querySelector('input');
    const hint = host.querySelector('p');
    const describedBy = input?.getAttribute('aria-describedby')?.split(' ');

    expect(input?.getAttribute('aria-invalid')).toBe('true');
    expect(input?.className).toContain('border-destructive');
    expect(describedBy).toContain('existing');
    expect(describedBy).toContain(hint?.id);
    expect(hint?.className).toContain('text-destructive');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});

describe('Textarea component', () => {
  it('renders textarea with invalid styles and hint', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Textarea defaultValue="Details" invalid hint="Fix the issue" />,
      );
    });

    const textarea = host.querySelector('textarea');
    const hint = host.querySelector('p');

    expect(textarea?.nodeName).toBe('TEXTAREA');
    expect(textarea?.className).toContain('resize-y');
    expect(textarea?.className).toContain('border-destructive');
    expect(textarea?.getAttribute('aria-invalid')).toBe('true');
    expect(hint?.textContent).toBe('Fix the issue');
    expect(hint?.className).toContain('text-destructive');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('displays a character counter when enabled', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Textarea
          value="Details"
          maxLength={120}
          showCount
          invalid
          hint="Add more detail"
        />,
      );
    });

    const textarea = host.querySelector('textarea');
    const describedByIds =
      textarea?.getAttribute('aria-describedby')?.split(' ') ?? [];
    const counterId = describedByIds.find((id) => id.endsWith('-counter'));
    const hintId = describedByIds.find((id) => id.endsWith('-hint'));
    const counter = counterId ? document.getElementById(counterId) : null;
    const hint = hintId ? document.getElementById(hintId) : null;

    expect(counter?.textContent).toBe('7 / 120');
    expect(counter?.className).toContain('text-destructive');
    expect(hint?.textContent).toBe('Add more detail');
    expect(describedByIds).toHaveLength(2);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('auto-resizes to fit content up to the default max height', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<Textarea autoResize value="Line 1" onChange={() => {}} />);
    });

    let textarea = host.querySelector('textarea');

    if (!textarea) {
      throw new Error('Expected textarea to be rendered');
    }

    Object.defineProperty(textarea, 'scrollHeight', {
      configurable: true,
      writable: true,
      value: 400,
    });

    await act(async () => {
      textarea.value = `${textarea.value}\nLine 2\nLine 3`;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    });

    await act(async () => {
      root.render(
        <Textarea
          autoResize
          value="Line 1\nLine 2\nLine 3"
          onChange={() => {}}
        />,
      );
    });

    textarea = host.querySelector('textarea');

    expect(textarea?.style.maxHeight).toBe('320px');
    expect(textarea?.style.height).toBe('320px');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
