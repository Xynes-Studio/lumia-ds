import React from 'react';
import { LumiaEditorPrimitive } from './internal/LumiaEditorPrimitive';
import { LumiaEditorStateJSON } from './types';

export interface LumiaEditorProps {
  value: LumiaEditorStateJSON | null;
  onChange: (value: LumiaEditorStateJSON) => void;
  className?: string;
  placeholder?: string;
}

export const LumiaEditor = ({
  value,
  onChange,
  className,
  placeholder = 'Type something...',
}: LumiaEditorProps) => {
  return (
    <LumiaEditorPrimitive
      value={value}
      onChange={onChange}
      className={className}
      placeholder={placeholder}
    />
  );
};
