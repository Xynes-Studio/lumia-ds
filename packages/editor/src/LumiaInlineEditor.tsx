import React from 'react';
import { LumiaInlineEditorPrimitive } from './internal/LumiaInlineEditorPrimitive';
import { LumiaEditorStateJSON } from './types';
import { EditorProvider } from './EditorProvider';
import type { FontConfig } from './font-config';

export interface LumiaInlineEditorProps {
  value: LumiaEditorStateJSON | null;
  onChange: (value: LumiaEditorStateJSON) => void;
  placeholder?: string;
  fonts?: FontConfig;
  className?: string;
}

export const LumiaInlineEditor = ({
  value,
  onChange,
  placeholder,
  fonts,
  className,
}: LumiaInlineEditorProps) => {
  return (
    <EditorProvider value={value} onChange={onChange} fonts={fonts}>
      <LumiaInlineEditorPrimitive
        className={className}
        placeholder={placeholder}
      />
    </EditorProvider>
  );
};
