import type { FC, ReactNode } from 'react';
export type { ButtonProps } from './button';
export { Button, buttonStyles } from './button';
export type { CheckboxProps } from './checkbox';
export { Checkbox } from './checkbox';
export type { InputProps, TextareaProps } from './input';
export { Input, Textarea } from './input';
export type { RadioProps } from './radio';
export { Radio } from './radio';
export type { SelectProps } from './select';
export { Select } from './select';

export type HelloProps = {
  name?: string;
  children?: ReactNode;
};

export const Hello: FC<HelloProps> = ({ name = 'Lumia', children }) => {
  return (
    <div role="status">
      <p>Hello, {name}!</p>
      {children}
    </div>
  );
};

export default Hello;
