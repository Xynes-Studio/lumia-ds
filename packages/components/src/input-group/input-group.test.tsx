import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { createRoot } from 'react-dom/client';
import {
  InputGroup,
  InputGroupInput,
  InputGroupPrefix,
  InputGroupSuffix,
} from './input-group';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('InputGroup component', () => {
  it('renders prefix and suffix around the input without double borders', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <InputGroup>
          <InputGroupPrefix>https://</InputGroupPrefix>
          <InputGroupInput placeholder="domain" />
          <InputGroupSuffix>.com</InputGroupSuffix>
        </InputGroup>,
      );
    });

    const group = host.querySelector('[role="group"]');
    const prefix = host.querySelector('div.border-r');
    const suffix = host.querySelector('div.border-l');
    const input = host.querySelector('input');

    expect(group?.className).toContain('overflow-hidden');
    expect(group?.className).toContain('focus-within:ring-primary-500');
    expect(prefix?.textContent).toBe('https://');
    expect(prefix?.className).toContain('bg-muted');
    expect(suffix?.textContent).toBe('.com');
    expect(suffix?.className).toContain('bg-muted');
    expect(input?.getAttribute('placeholder')).toBe('domain');
    expect(input?.className).toContain('border-0');
    expect(input?.className).not.toContain('border-border');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('shares invalid and disabled state with children', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <InputGroup invalid disabled>
          <InputGroupPrefix>Label</InputGroupPrefix>
          <InputGroupInput />
          <InputGroupSuffix>Action</InputGroupSuffix>
        </InputGroup>,
      );
    });

    const group = host.querySelector('[role="group"]');
    const prefix = host.querySelector('div.border-r');
    const suffix = host.querySelector('div.border-l');
    const input = host.querySelector('input');

    expect(group?.className).toContain('border-destructive');
    expect(group?.className).toContain('cursor-not-allowed');
    expect(group?.getAttribute('aria-disabled')).toBe('true');
    expect(prefix?.getAttribute('aria-disabled')).toBe('true');
    expect(suffix?.getAttribute('aria-disabled')).toBe('true');
    expect(input?.getAttribute('disabled')).toBe('');
    expect(input?.getAttribute('aria-invalid')).toBe('true');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
