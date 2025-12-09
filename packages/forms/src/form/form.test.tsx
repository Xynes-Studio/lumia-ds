import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { Controller, useForm, useFormContext } from 'react-hook-form';
import { LumiaForm } from './form';
import { ValidatedInput } from '../validated-input/validated-input';
import { required } from '../validation/validation';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { host, root };
};

const DirtyFlag = () => {
  const { formState } = useFormContext<{ name: string }>();
  return (
    <span data-dirty={formState.isDirty ? 'true' : 'false'} aria-hidden="true">
      state
    </span>
  );
};

describe('LumiaForm', () => {
  it('uses provided methods, wraps FormProvider, and submits values', async () => {
    const handleSubmit = vi.fn();
    const Form = () => {
      const methods = useForm<{ name: string }>({
        defaultValues: { name: '' },
      });

      return (
        <LumiaForm methods={methods} onSubmit={handleSubmit}>
          {({ control }) => (
            <>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Name is required' }}
                render={({ field, fieldState }) => (
                  <ValidatedInput
                    {...field}
                    ref={field.ref}
                    value={field.value ?? ''}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(next: any) => field.onChange(next)}
                    onBlur={field.onBlur}
                    hint="Full name"
                    errorMessage={fieldState.error?.message}
                    rules={[required('Name is required')]}
                  />
                )}
              />
              <DirtyFlag />
              <button type="submit">Save</button>
            </>
          )}
        </LumiaForm>
      );
    };

    const { host, root } = createTestRoot();

    await act(async () => {
      root.render(<Form />);
    });

    const form = host.querySelector('form') as HTMLFormElement;
    const input = host.querySelector('input') as HTMLInputElement;
    const state = host.querySelector('span[data-dirty]') as HTMLSpanElement;

    expect(state.dataset.dirty).toBe('false');

    await act(async () => {
      input.value = 'Ada Lovelace';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Simulate.change(input, { target: { value: 'Ada Lovelace' } } as any);
      await Promise.resolve();
    });

    expect(state.dataset.dirty).toBe('true');

    await act(async () => {
      Simulate.submit(form);
      await Promise.resolve();
    });

    expect(handleSubmit).toHaveBeenCalledWith(
      { name: 'Ada Lovelace' },
      expect.anything(),
    );

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('creates methods from options when not provided and reports validation errors', async () => {
    const handleSubmit = vi.fn();
    const handleError = vi.fn();

    const Form = () => (
      <LumiaForm
        onSubmit={handleSubmit}
        onError={handleError}
        options={{ defaultValues: { name: '' } }}
      >
        {({ control }) => (
          <>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Name is required' }}
              render={({ field, fieldState }) => (
                <ValidatedInput
                  {...field}
                  ref={field.ref}
                  value={field.value ?? ''}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(next: any) => field.onChange(next)}
                  onBlur={field.onBlur}
                  hint="Full name"
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <button type="submit">Submit</button>
          </>
        )}
      </LumiaForm>
    );

    const { host, root } = createTestRoot();

    await act(async () => {
      root.render(<Form />);
    });

    const form = host.querySelector('form') as HTMLFormElement;
    const input = host.querySelector('input') as HTMLInputElement;

    expect(input.getAttribute('aria-invalid')).toBeNull();

    await act(async () => {
      Simulate.submit(form);
      await Promise.resolve();
    });

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledTimes(1);
    expect(host.querySelector('p')?.textContent).toBe('Name is required');
    expect(input.getAttribute('aria-invalid')).toBe('true');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
  it('validates multiple fields and handles successful submission', async () => {
    const handleSubmit = vi.fn();

    const ComplexForm = () => (
      <LumiaForm
        onSubmit={handleSubmit}
        options={{ defaultValues: { name: '', age: '' } }}
      >
        {({ control }) => (
          <>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Name is required' }}
              render={({ field, fieldState }) => (
                <ValidatedInput
                  {...field}
                  hint="Name"
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="age"
              control={control}
              rules={{
                required: 'Age is required',
                min: { value: 18, message: 'Must be 18+' },
              }}
              render={({ field, fieldState }) => (
                <ValidatedInput
                  {...field}
                  type="number"
                  hint="Age"
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <button type="submit">Submit</button>
          </>
        )}
      </LumiaForm>
    );

    const { host, root } = createTestRoot();
    await act(async () => {
      root.render(<ComplexForm />);
    });

    const form = host.querySelector('form') as HTMLFormElement;
    const inputs = host.querySelectorAll('input');
    const nameInput = inputs[0];
    const ageInput = inputs[1];

    // Submit empty
    await act(async () => {
      Simulate.submit(form);
      await Promise.resolve();
    });

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(host.textContent).toContain('Name is required');
    expect(host.textContent).toContain('Age is required');

    // Fix name, break age
    await act(async () => {
      nameInput.value = 'John';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Simulate.change(nameInput, { target: { value: 'John' } } as any);
      ageInput.value = '10';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Simulate.change(ageInput, { target: { value: '10' } } as any);
      await Promise.resolve();
    });

    await act(async () => {
      Simulate.submit(form);
      await Promise.resolve();
    });

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(host.textContent).toContain('Must be 18+');

    // Fix all
    await act(async () => {
      ageInput.value = '20';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Simulate.change(ageInput, { target: { value: '20' } } as any);
      await Promise.resolve();
    });

    await act(async () => {
      Simulate.submit(form);
      await Promise.resolve();
    });

    expect(handleSubmit).toHaveBeenCalledWith(
      { name: 'John', age: '20' },
      expect.anything(),
    );

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
