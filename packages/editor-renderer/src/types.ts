import { SerializedEditorState } from 'lexical';
import React from 'react';

export type LumiaEditorStateJSON = SerializedEditorState;

export interface BlockDefinition {
  type: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component?: React.ComponentType<{ node: any; children?: React.ReactNode }>;
  [key: string]: unknown;
}
