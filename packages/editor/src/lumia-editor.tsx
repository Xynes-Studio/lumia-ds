import React from 'react';
import { LumiaEditorPrimitive } from './internal/LumiaEditorPrimitive';
import { LumiaEditorStateJSON } from './types';

export interface LumiaEditorProps {
  value: LumiaEditorStateJSON | null;
  onChange: (value: LumiaEditorStateJSON) => void;
  mode?: 'document' | 'inline';
  variant?: 'full' | 'compact';
  readOnly?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fonts?: any; // TODO: Replace with FontConfig type in later stories
  className?: string;
}

export const LumiaEditor = ({
  value,
  onChange,
  className,
  readOnly,
}: LumiaEditorProps) => {
  return (
    <LumiaEditorPrimitive
      value={value}
      onChange={onChange}
      className={className}
      readOnly={readOnly}
    />
  );
};
