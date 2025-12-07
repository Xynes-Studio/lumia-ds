import React, { useCallback, useEffect, useState } from 'react';
import { NodeKey } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Input, Select } from '@lumia/components';
import { $getNodeByKey } from 'lexical';
import { $isStatusNode, StatusColor } from './StatusNode';

export const StatusInspector: React.FC<{ nodeKey: NodeKey }> = ({
  nodeKey,
}) => {
  const [editor] = useLexicalComposerContext();
  const [data, setData] = useState<{
    text: string;
    color: StatusColor;
  }>({
    text: 'Status',
    color: 'info',
  });

  useEffect(() => {
    const update = () => {
      editor.getEditorState().read(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isStatusNode(node)) {
          setData({
            text: node.getText(),
            color: node.getColor(),
          });
        }
      });
    };
    update();
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isStatusNode(node)) {
          setData({
            text: node.getText(),
            color: node.getColor(),
          });
        }
      });
    });
  }, [editor, nodeKey]);

  const updateText = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newText = e.target.value;
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isStatusNode(node)) {
          node.setText(newText);
        }
      });
    },
    [editor, nodeKey],
  );

  const updateColor = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newColor = e.target.value as StatusColor;
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isStatusNode(node)) {
          node.setColor(newColor);
        }
      });
    },
    [editor, nodeKey],
  );

  return (
    <div className="space-y-4 p-4">
      <h3 className="mb-2 text-lg font-medium">Status Inspector</h3>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Text</label>
        <Input
          value={data.text}
          onChange={updateText}
          placeholder="Status Text"
        />
      </div>

      <Select label="Color" value={data.color} onChange={updateColor}>
        <option value="info">Info</option>
        <option value="success">Success</option>
        <option value="warning">Warning</option>
        <option value="error">Error</option>
      </Select>
    </div>
  );
};
