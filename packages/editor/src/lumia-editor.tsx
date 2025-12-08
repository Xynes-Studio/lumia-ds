import React from 'react';
import { LumiaEditorPrimitive } from './internal/LumiaEditorPrimitive';
import { LumiaInlineEditorPrimitive } from './internal/LumiaInlineEditorPrimitive';
import { LumiaEditorStateJSON } from './types';
import { EditorProvider } from './EditorProvider';
import type { FontConfig } from './font-config';
import type { EditorMediaConfig } from './media-config';

export interface LumiaEditorProps {
  value: LumiaEditorStateJSON | null;
  onChange: (value: LumiaEditorStateJSON) => void;
  mode?: 'document' | 'inline';
  variant?: 'full' | 'compact';
  readOnly?: boolean;
  fonts?: FontConfig;
  media?: EditorMediaConfig;
  className?: string;
  children?: React.ReactNode;
}

export const LumiaEditor = ({
  value,
  onChange,
  className,
  readOnly,
  fonts,
  media,
  variant,
  mode = 'document',
  children,
}: LumiaEditorProps) => {
  return (
    <EditorProvider
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      fonts={fonts}
      media={media}
    >
      {mode === 'inline' ? (
        <LumiaInlineEditorPrimitive className={className} />
      ) : (
        <LumiaEditorPrimitive className={className} variant={variant} />
      )}
      {children}
    </EditorProvider>
  );
};
