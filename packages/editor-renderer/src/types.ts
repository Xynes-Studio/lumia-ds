import { SerializedEditorState } from 'lexical';

export type LumiaEditorStateJSON = SerializedEditorState;

export interface BlockDefinition {
  type: string;
  label: string;
  [key: string]: unknown;
}
