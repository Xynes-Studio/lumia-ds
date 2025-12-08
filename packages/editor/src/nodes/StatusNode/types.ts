import { NodeKey } from 'lexical';

export type StatusColor = 'success' | 'warning' | 'error' | 'info';

export interface StatusNodePayload {
  text: string;
  color: StatusColor;
  key?: NodeKey;
}
