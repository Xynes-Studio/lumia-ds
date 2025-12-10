import React from 'react';
import { StatusPill } from '@lumia-ui/components';

export const StatusBlock = ({
  node,
}: {
  node: { text: string; color?: 'info' | 'success' | 'warning' | 'error' };
}) => {
  // Ensure we map any legacy colors to valid StatusPill variants
  const color = node.color || 'info';
  return (
    <StatusPill
      variant={color}
      className="inline-flex mx-1 text-xs px-2 py-0.5 align-middle"
    >
      {node.text}
    </StatusPill>
  );
};
