import React from 'react';
import { LumiaEditorPrimitive } from './internal/LumiaEditorPrimitive';
import { LumiaEditorStateJSON } from './types';
import { EditorProvider } from './EditorProvider';
import type { FontConfig } from './font-config';

export interface LumiaEditorProps {
  value: LumiaEditorStateJSON | null;
  onChange: (value: LumiaEditorStateJSON) => void;
  mode?: 'document' | 'inline';
  variant?: 'full' | 'compact';
  readOnly?: boolean;
  fonts?: FontConfig;
  className?: string;
}

export const LumiaEditor = ({
  value,
  onChange,
  className,
  readOnly,
  fonts,
}: LumiaEditorProps) => {
  return (
    <EditorProvider
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      fonts={fonts}
    >
      <LumiaEditorPrimitive className={className} />
    </EditorProvider>
  );
};
