import { act } from 'react';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { ValidatedInput } from './validated-input';
import { minLength, required } from '../validation/validation';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { host, root };
};

describe('ValidatedInput', () => {
  it('runs rules on change and shows the first failing message', async () => {
    const rules = [required('Name is required'), minLength(3, 'Too short')];
    const changeSpy = vi.fn();

    const ControlledInput = () => {
      const [value, setValue] = useState('');
      return (
        <ValidatedInput
          value={value}
          onChange={(next) => {
            changeSpy(next);
            setValue(next);
          }}
          rules={rules}
          placeholder="Name"
          hint="Helper text"
        />
      );
    };

    const { host, root } = createTestRoot();

    await act(async () => {
      root.render(<ControlledInput />);
    });

    const input = host.querySelector('input') as HTMLInputElement;

    expect(host.querySelector('p')?.textContent).toBe('Helper text');
    expect(input.getAttribute('aria-invalid')).toBeNull();

    await act(async () => {
      input.value = 'hello';
      Simulate.change(input, { target: { value: 'hello' } });
      await Promise.resolve();
    });

    expect(host.querySelector('p')?.textContent).toBe('Helper text');
    expect(input.getAttribute('aria-invalid')).toBeNull();
    expect(changeSpy).toHaveBeenCalledTimes(1);

    await act(async () => {
      input.value = '';
      Simulate.change(input, { target: { value: '' } });
      await Promise.resolve();
    });

    expect(changeSpy).toHaveBeenCalledTimes(2);
    expect(host.querySelector('p')?.textContent).toBe('Name is required');
    expect(input.getAttribute('aria-invalid')).toBe('true');

    await act(async () => {
      input.value = 'hi';
      Simulate.change(input, { target: { value: 'hi' } });
      await Promise.resolve();
    });

    expect(host.querySelector('p')?.textContent).toBe('Too short');
    expect(input.getAttribute('aria-invalid')).toBe('true');

    await act(async () => {
      input.value = 'hello';
      Simulate.change(input, { target: { value: 'hello' } });
      await Promise.resolve();
    });

    expect(host.querySelector('p')?.textContent).toBe('Helper text');
    expect(input.getAttribute('aria-invalid')).toBeNull();
    expect(changeSpy).toHaveBeenCalledTimes(4);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('validates on blur and calls the provided onBlur handler', async () => {
    const rules = [required('This field is required')];
    const handleBlur = vi.fn();

    const ControlledInput = () => {
      const [value, setValue] = useState('');
      return (
        <ValidatedInput
          value={value}
          onChange={setValue}
          rules={rules}
          onBlur={handleBlur}
        />
      );
    };

    const { host, root } = createTestRoot();

    await act(async () => {
      root.render(<ControlledInput />);
    });

    const input = host.querySelector('input') as HTMLInputElement;

    await act(async () => {
      input.focus();
      Simulate.blur(input);
      await Promise.resolve();
    });

    expect(handleBlur).toHaveBeenCalledTimes(1);
    expect(host.querySelector('p')?.textContent).toBe('This field is required');
    expect(input.getAttribute('aria-invalid')).toBe('true');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('surfaces externally provided error messages', async () => {
    const ControlledInput = ({ message }: { message: string | null }) => {
      const [value, setValue] = useState('');
      return (
        <ValidatedInput
          value={value}
          onChange={setValue}
          errorMessage={message}
          hint="Helper text"
        />
      );
    };

    const { host, root } = createTestRoot();

    await act(async () => {
      root.render(<ControlledInput message="External error" />);
    });

    const input = host.querySelector('input') as HTMLInputElement;

    expect(host.querySelector('p')?.textContent).toBe('External error');
    expect(input.getAttribute('aria-invalid')).toBe('true');

    await act(async () => {
      root.render(<ControlledInput message={null} />);
    });

    expect(host.querySelector('p')?.textContent).toBe('Helper text');
    expect(input.getAttribute('aria-invalid')).toBeNull();

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
