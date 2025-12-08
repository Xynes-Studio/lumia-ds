import * as React from 'react';
import { StatusPill } from '@lumia/components';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { NodeKey } from 'lexical';
import { StatusColor } from './types';

interface StatusNodeComponentProps {
  text: string;
  color: StatusColor;
  nodeKey: NodeKey;
}

export function StatusNodeComponent({
  text,
  color,
  nodeKey,
}: StatusNodeComponentProps) {
  const [isSelected, setSelected] = useLexicalNodeSelection(nodeKey);

  const onClick = React.useCallback(
    (event: React.MouseEvent) => {
      if (event.shiftKey) {
        setSelected(!isSelected);
        event.preventDefault();
        event.stopPropagation();
      }
    },
    [isSelected, setSelected],
  );

  return (
    <span
      className={`inline-flex items-center align-middle ${
        isSelected ? 'ring-2 ring-offset-1 ring-primary-500 rounded-full' : ''
      }`}
      onClick={onClick}
    >
      <StatusPill variant={color}>{text}</StatusPill>
    </span>
  );
}
