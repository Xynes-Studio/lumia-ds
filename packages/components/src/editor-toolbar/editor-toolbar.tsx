import type { HTMLAttributes, ReactElement, ReactNode } from 'react';
import { cn } from '../lib/utils';
import { Flex } from '../flex/flex';

export type EditorToolbarProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export const EditorToolbar = ({
  children,
  className,
  ...props
}: EditorToolbarProps): ReactElement => {
  return (
    <Flex
      align="center"
      justify="between"
      gap="sm"
      wrap="wrap"
      className={cn(
        'w-full border-b border-border bg-background p-2',
        className,
      )}
      {...props}
    >
      {children}
    </Flex>
  );
};

export type EditorToolbarGroupProps = HTMLAttributes<HTMLDivElement> & {
  align?: 'start' | 'end';
  children?: ReactNode;
};

export const EditorToolbarGroup = ({
  align = 'start',
  children,
  className,
  ...props
}: EditorToolbarGroupProps): ReactElement => {
  return (
    <Flex
      align="center"
      gap="xs"
      className={cn(align === 'end' ? 'ml-auto' : '', className)}
      {...props}
    >
      {children}
    </Flex>
  );
};
