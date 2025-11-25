import type { ReactNode } from 'react';
import { forwardRef, useEffect, useMemo } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Select,
  Textarea,
  type CardProps,
} from '@lumia/components';
import {
  Controller,
  LumiaForm,
  useForm,
  ValidatedInput,
  type FieldValues,
  type SubmitHandler,
  type UseFormProps,
  type UseControllerProps,
  type UseFormReturn,
  type ValidationRule,
} from '@lumia/forms';
import type { ResourceConfig } from './index';

type Alignment = 'start' | 'center' | 'end';

const alignClassNames: Record<Alignment, string> = {
  start: 'text-left',
  center: 'text-center',
  end: 'text-right',
};

const columnSpanClassNames: Record<1 | 2 | 3, string> = {
  1: 'md:col-span-1',
  2: 'md:col-span-2',
  3: 'md:col-span-3',
};

const gridColumnClassNames: Record<1 | 2 | 3, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
};

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

type DataRecord = Record<string, unknown>;

const getValueAtPath = (input: unknown, path: string): unknown => {
  const segments = path.split('.');

  return segments.reduce<unknown>((current, segment) => {
    if (
      current &&
      typeof current === 'object' &&
      Object.prototype.hasOwnProperty.call(current, segment)
    ) {
      return (current as Record<string, unknown>)[segment];
    }

    return undefined;
  }, input);
};

const formatDefaultValue = (value: unknown): ReactNode => {
  if (value === null || value === undefined) {
    return '—';
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : '—';
  }

  if (value instanceof Date) {
    return value.toLocaleString();
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
};

export type FormFieldKind = 'text' | 'textarea' | 'select' | 'checkbox';

export type FieldOption = { label: string; value: string };

export type FieldConfig<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends keyof TFieldValues & string = keyof TFieldValues & string,
> = {
  name: TFieldName;
  label: string;
  kind?: FormFieldKind;
  placeholder?: string;
  hint?: string;
  defaultValue?: TFieldValues[TFieldName];
  options?: FieldOption[];
  validation?: ValidationRule<TFieldValues[TFieldName], TFieldValues>[];
  disabled?: boolean;
};

export type FormDataFetcher<TFieldValues extends FieldValues = FieldValues> = {
  create?: SubmitHandler<TFieldValues>;
  update?: SubmitHandler<TFieldValues>;
};

const buildDefaultValues = <TFieldValues extends FieldValues>(
  fields: FieldConfig<TFieldValues>[],
  initialValues?: Partial<TFieldValues>,
) => {
  const defaults: Partial<TFieldValues> = {};

  fields.forEach((field) => {
    if (field.defaultValue !== undefined) {
      defaults[field.name] = field.defaultValue;
    }
  });

  return {
    ...defaults,
    ...(initialValues ?? {}),
  } satisfies Partial<TFieldValues>;
};

const buildValidationRules = <
  TFieldValues extends FieldValues,
  TValue = unknown,
>(
  rules: ValidationRule<TValue, TFieldValues>[] | undefined,
  methods: UseFormReturn<TFieldValues>,
): UseControllerProps<TFieldValues>['rules'] => {
  if (!rules?.length) return undefined;

  const validators = rules.reduce<
    Record<
      string,
      (value: unknown) => boolean | string | Promise<boolean | string>
    >
  >((acc, rule) => {
    acc[rule.name] = async (value) => {
      const context = methods.getValues();
      const isValid = await rule.validate(
        value as TValue,
        context as unknown as TFieldValues,
      );

      return isValid || rule.message;
    };
    return acc;
  }, {});

  return { validate: validators };
};

export type ListBlockColumn = {
  key: string;
  label: string;
  field?: string;
  align?: Alignment;
  render?: (context: {
    value: unknown;
    record: DataRecord;
    rowIndex: number;
    columnIndex: number;
  }) => ReactNode;
};

export type ListBlockProps = CardProps & {
  title?: string;
  description?: string;
  data: DataRecord[];
  columns: ListBlockColumn[];
  emptyMessage?: string;
};

export type ListBlockConfig = Pick<
  ListBlockProps,
  'title' | 'description' | 'columns' | 'emptyMessage'
>;

export const ListBlock = forwardRef<HTMLDivElement, ListBlockProps>(
  function ListBlock(
    {
      title,
      description,
      data,
      columns,
      emptyMessage = 'No records to display',
      className,
      ...props
    },
    ref,
  ) {
    const headerPresent = Boolean(title || description);
    const resolvedColumns = columns ?? [];
    const rows = data ?? [];

    return (
      <Card
        ref={ref}
        className={cx('bg-background text-foreground', className)}
        {...props}
      >
        {headerPresent && (
          <CardHeader>
            {title ? (
              <CardTitle>{title}</CardTitle>
            ) : (
              <span className="sr-only">List block</span>
            )}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead className="bg-muted/40">
                <tr>
                  {resolvedColumns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className={cx(
                        'border-b border-border/80 px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted',
                        alignClassNames[column.align ?? 'start'],
                      )}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={Math.max(resolvedColumns.length, 1)}
                      className="px-4 py-6 text-center text-sm text-muted"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  rows.map((record, rowIndex) => (
                    <tr
                      key={rowIndex}
                      data-row-index={rowIndex}
                      className={rowIndex % 2 === 1 ? 'bg-muted/10' : undefined}
                    >
                      {resolvedColumns.map((column, columnIndex) => {
                        const lookupKey = column.field ?? column.key;
                        const rawValue =
                          typeof lookupKey === 'string'
                            ? getValueAtPath(record, lookupKey)
                            : undefined;
                        const cell =
                          column.render?.({
                            value: rawValue,
                            record,
                            rowIndex,
                            columnIndex,
                          }) ?? formatDefaultValue(rawValue);

                        return (
                          <td
                            key={`${column.key}-${columnIndex}`}
                            data-column-key={column.key}
                            className={cx(
                              'border-b border-border/60 px-4 py-3 text-foreground',
                              alignClassNames[column.align ?? 'start'],
                            )}
                          >
                            {cell}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  },
);

export type FormBlockProps<TFieldValues extends FieldValues = FieldValues> =
  CardProps & {
    title?: string;
    description?: string;
    resource: ResourceConfig<TFieldValues>;
    mode: 'create' | 'update';
    initialValues?: Partial<TFieldValues>;
    submitLabel?: string;
    emptyMessage?: string;
    dataFetcher?: FormDataFetcher<TFieldValues>;
    onSubmit?: SubmitHandler<TFieldValues>;
  };

export type FormBlockConfig<TFieldValues extends FieldValues = FieldValues> =
  Pick<
    FormBlockProps<TFieldValues>,
    | 'title'
    | 'description'
    | 'resource'
    | 'mode'
    | 'initialValues'
    | 'submitLabel'
    | 'emptyMessage'
  >;

export const FormBlock = forwardRef<HTMLDivElement, FormBlockProps>(
  function FormBlock(
    {
      title,
      description,
      resource,
      mode,
      initialValues,
      submitLabel,
      emptyMessage = 'No fields configured',
      dataFetcher,
      onSubmit,
      className,
      ...props
    },
    ref,
  ) {
    const fields = resource.fields ?? [];
    const defaults = useMemo(
      () => buildDefaultValues(fields, initialValues),
      [fields, initialValues],
    );
    const methods = useForm({
      defaultValues: defaults as UseFormProps['defaultValues'],
    });

    useEffect(() => {
      methods.reset(defaults as UseFormProps['defaultValues']);
    }, [defaults, methods]);

    const headerPresent = Boolean(title || description);
    const resolvedSubmit =
      onSubmit ?? dataFetcher?.[mode] ?? resource.dataFetcher?.[mode];
    const resolvedSubmitLabel =
      submitLabel ?? (mode === 'create' ? 'Create' : 'Update');

    const handleSubmit: SubmitHandler = async (values, event) => {
      if (resolvedSubmit) {
        await resolvedSubmit(values, event);
      }
    };

    const renderField = (fieldConfig: FieldConfig) => {
      const fieldId = `${resource.id}-${fieldConfig.name}`;
      const controllerRules = buildValidationRules(
        fieldConfig.validation,
        methods,
      );

      if (fieldConfig.kind === 'select') {
        return (
          <div
            key={fieldConfig.name}
            data-field-name={fieldConfig.name}
            className="flex flex-col gap-2"
          >
            <Controller
              name={fieldConfig.name}
              control={methods.control}
              rules={controllerRules}
              render={({ field, fieldState }) => (
                <Select
                  {...field}
                  ref={field.ref}
                  id={fieldId}
                  value={field.value ?? ''}
                  onChange={(event) => field.onChange(event.target.value)}
                  label={fieldConfig.label}
                  placeholder={fieldConfig.placeholder}
                  hint={fieldState.error?.message ?? fieldConfig.hint}
                  invalid={Boolean(fieldState.error)}
                  disabled={fieldConfig.disabled}
                >
                  {fieldConfig.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              )}
            />
          </div>
        );
      }

      if (fieldConfig.kind === 'textarea') {
        return (
          <div
            key={fieldConfig.name}
            data-field-name={fieldConfig.name}
            className="flex flex-col gap-2"
          >
            <label
              htmlFor={fieldId}
              className="text-sm font-medium text-foreground"
            >
              {fieldConfig.label}
            </label>
            <Controller
              name={fieldConfig.name}
              control={methods.control}
              rules={controllerRules}
              render={({ field, fieldState }) => (
                <Textarea
                  {...field}
                  ref={field.ref}
                  id={fieldId}
                  value={field.value ?? ''}
                  onChange={(event) => field.onChange(event.target.value)}
                  placeholder={fieldConfig.placeholder}
                  hint={fieldState.error?.message ?? fieldConfig.hint}
                  invalid={Boolean(fieldState.error)}
                  disabled={fieldConfig.disabled}
                />
              )}
            />
          </div>
        );
      }

      if (fieldConfig.kind === 'checkbox') {
        return (
          <div
            key={fieldConfig.name}
            data-field-name={fieldConfig.name}
            className="flex flex-col gap-2"
          >
            <Controller
              name={fieldConfig.name}
              control={methods.control}
              rules={controllerRules}
              render={({ field, fieldState }) => (
                <Checkbox
                  {...field}
                  ref={field.ref}
                  id={fieldId}
                  checked={Boolean(field.value)}
                  onChange={(event) => field.onChange(event.target.checked)}
                  label={fieldConfig.label}
                  hint={fieldState.error?.message ?? fieldConfig.hint}
                  invalid={Boolean(fieldState.error)}
                  disabled={fieldConfig.disabled}
                />
              )}
            />
          </div>
        );
      }

      return (
        <div
          key={fieldConfig.name}
          data-field-name={fieldConfig.name}
          className="flex flex-col gap-2"
        >
          <label
            htmlFor={fieldId}
            className="text-sm font-medium text-foreground"
          >
            {fieldConfig.label}
          </label>
          <Controller
            name={fieldConfig.name}
            control={methods.control}
            rules={controllerRules}
            render={({ field, fieldState }) => (
              <ValidatedInput
                {...field}
                ref={field.ref}
                id={fieldId}
                value={(field.value ?? '') as string}
                onChange={(nextValue) => field.onChange(nextValue)}
                onBlur={field.onBlur}
                placeholder={fieldConfig.placeholder}
                hint={fieldConfig.hint}
                errorMessage={fieldState.error?.message}
                rules={fieldConfig.validation}
                disabled={fieldConfig.disabled}
              />
            )}
          />
        </div>
      );
    };

    return (
      <Card
        ref={ref}
        className={cx('bg-background text-foreground', className)}
        {...props}
      >
        {headerPresent && (
          <CardHeader>
            {title ? (
              <CardTitle>{title}</CardTitle>
            ) : (
              <span className="sr-only">Form block</span>
            )}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}

        <CardContent>
          {fields.length === 0 ? (
            <p className="text-sm text-muted">{emptyMessage}</p>
          ) : (
            <LumiaForm methods={methods} onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 gap-4">
                  {fields.map((field) => renderField(field))}
                </div>
                <div className="flex justify-end">
                  <Button type="submit">{resolvedSubmitLabel}</Button>
                </div>
              </div>
            </LumiaForm>
          )}
        </CardContent>
      </Card>
    );
  },
);

export type DetailBlockField = {
  key: string;
  label: string;
  field?: string;
  hint?: string;
  span?: 1 | 2 | 3;
  render?: (context: { value: unknown; record: DataRecord }) => ReactNode;
};

export type DetailBlockProps = CardProps & {
  title?: string;
  description?: string;
  record: DataRecord;
  fields: DetailBlockField[];
  columns?: 1 | 2 | 3;
  emptyMessage?: string;
};

export type DetailBlockConfig = Pick<
  DetailBlockProps,
  'title' | 'description' | 'fields' | 'columns' | 'emptyMessage'
>;

export const DetailBlock = forwardRef<HTMLDivElement, DetailBlockProps>(
  function DetailBlock(
    {
      title,
      description,
      record,
      fields,
      columns = 2,
      emptyMessage = 'No details available',
      className,
      ...props
    },
    ref,
  ) {
    const headerPresent = Boolean(title || description);
    const columnClass =
      gridColumnClassNames[columns] ?? gridColumnClassNames[2];
    const safeFields = fields ?? [];
    const sourceRecord = record ?? {};

    return (
      <Card
        ref={ref}
        className={cx('bg-background text-foreground', className)}
        {...props}
      >
        {headerPresent && (
          <CardHeader>
            {title ? (
              <CardTitle>{title}</CardTitle>
            ) : (
              <span className="sr-only">Detail block</span>
            )}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}

        <CardContent>
          {safeFields.length === 0 ? (
            <p className="text-sm text-muted">{emptyMessage}</p>
          ) : (
            <dl className={cx('grid grid-cols-1 gap-4', columnClass)}>
              {safeFields.map((field) => {
                const lookupKey = field.field ?? field.key;
                const rawValue =
                  typeof lookupKey === 'string'
                    ? getValueAtPath(sourceRecord, lookupKey)
                    : undefined;
                const value =
                  field.render?.({ value: rawValue, record: sourceRecord }) ??
                  formatDefaultValue(rawValue);
                const spanClass = field.span
                  ? (columnSpanClassNames[field.span] ?? undefined)
                  : undefined;

                return (
                  <div
                    key={field.key}
                    data-field-key={field.key}
                    className={cx(
                      'rounded-lg border border-border/70 bg-background/60 p-4',
                      spanClass,
                    )}
                  >
                    <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                      {field.label}
                    </dt>
                    {field.hint && (
                      <p className="mt-1 text-xs text-muted">{field.hint}</p>
                    )}
                    <dd className="mt-2 text-sm text-foreground">{value}</dd>
                  </div>
                );
              })}
            </dl>
          )}
        </CardContent>
      </Card>
    );
  },
);
