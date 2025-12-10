import type { FormHTMLAttributes, ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import type {
  FieldValues,
  SubmitErrorHandler,
  SubmitHandler,
  UseFormProps,
  UseFormReturn,
} from 'react-hook-form';

type LumiaFormChildren<TFieldValues extends FieldValues> =
  | ReactNode
  | ((methods: UseFormReturn<TFieldValues>) => ReactNode);

export type LumiaFormProps<TFieldValues extends FieldValues = FieldValues> = {
  children: LumiaFormChildren<TFieldValues>;
  methods?: UseFormReturn<TFieldValues>;
  options?: UseFormProps<TFieldValues>;
  onSubmit: SubmitHandler<TFieldValues>;
  onError?: SubmitErrorHandler<TFieldValues>;
} & Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'>;

export function LumiaForm<TFieldValues extends FieldValues = FieldValues>({
  children,
  methods,
  options,
  onSubmit,
  onError,
  ...formProps
}: LumiaFormProps<TFieldValues>) {
  const createdMethods = useForm<TFieldValues>(options);
  const formMethods = methods ?? createdMethods;
  const handleSubmit = formMethods.handleSubmit(onSubmit, onError);

  return (
    <FormProvider {...formMethods}>
      <form {...formProps} onSubmit={handleSubmit}>
        {typeof children === 'function' ? children(formMethods) : children}
      </form>
    </FormProvider>
  );
}
