import React from 'react';
import { LumiaEditorPrimitive } from './internal/LumiaEditorPrimitive';
import { LumiaEditorStateJSON } from './types';
import { EditorProvider } from './EditorProvider';

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
    <EditorProvider value={value} onChange={onChange} readOnly={readOnly}>
      <LumiaEditorPrimitive className={className} />
    </EditorProvider>
  );
};
