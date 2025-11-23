import type { FC, ReactNode } from 'react';

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
