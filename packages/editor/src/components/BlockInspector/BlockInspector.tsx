import React from 'react';
import { useEditorContext } from '../../EditorProvider';
import { getBlockDefinition } from '../../blocks/registry';
import { BlockType } from '../../blocks/types';
import { Card, CardContent } from '@lumia/components';

export interface BlockInspectorProps {
  className?: string;
}

export const BlockInspector: React.FC<BlockInspectorProps> = ({
  className,
}) => {
  const { selectedBlock } = useEditorContext();

  if (!selectedBlock) {
    return (
      <Card className={className}>
        <CardContent className="p-4 text-sm text-muted-foreground">
          No block selected
        </CardContent>
      </Card>
    );
  }

  const { nodeKey, blockType } = selectedBlock;
  const blockDefinition = getBlockDefinition(blockType as BlockType);

  if (!blockDefinition || !blockDefinition.inspector) {
    return (
      <Card className={className}>
        <CardContent className="p-4 text-sm text-muted-foreground">
          No configurable properties
        </CardContent>
      </Card>
    );
  }

  const Inspector = blockDefinition.inspector;

  return (
    <Card className={className}>
      <Inspector nodeKey={nodeKey} />
    </Card>
  );
};
