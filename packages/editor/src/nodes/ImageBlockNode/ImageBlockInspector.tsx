import React from 'react';
import { NodeKey } from 'lexical';

export const ImageBlockInspector: React.FC<{ nodeKey: NodeKey }> = ({
  nodeKey,
}) => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-2">Image inspector</h3>
      <p className="text-sm text-gray-500">Node Key: {nodeKey}</p>
    </div>
  );
};
