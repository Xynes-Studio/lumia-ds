import React, { useCallback, useEffect, useState } from 'react';
import { NodeKey } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Input } from '@lumia-ui/components';
import { $getNodeByKey } from 'lexical';
import { $isPanelBlockNode, PanelVariant } from './PanelBlockNode';
import { Dropdown } from '../../components/Dropdown';

const VARIANT_OPTIONS = [
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'success', label: 'Success' },
  { value: 'note', label: 'Note' },
];

export const PanelBlockInspector: React.FC<{ nodeKey: NodeKey }> = ({
  nodeKey,
}) => {
  const [editor] = useLexicalComposerContext();
  const [data, setData] = useState<{
    variant: PanelVariant;
    title: string;
  }>({
    variant: 'info',
    title: '',
  });

  useEffect(() => {
    const update = () => {
      editor.getEditorState().read(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isPanelBlockNode(node)) {
          setData({
            variant: node.__variant || 'info',
            title: node.__title || '',
          });
        }
      });
    };
    update();
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isPanelBlockNode(node)) {
          setData({
            variant: node.__variant || 'info',
            title: node.__title || '',
          });
        }
      });
    });
  }, [editor, nodeKey]);

  const updateVariant = useCallback(
    (value: string) => {
      const newVariant = value as PanelVariant;
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isPanelBlockNode(node)) {
          node.setVariant(newVariant);
        }
      });
    },
    [editor, nodeKey],
  );

  const updateTitle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value;
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isPanelBlockNode(node)) {
          node.setTitle(newTitle);
        }
      });
    },
    [editor, nodeKey],
  );

  return (
    <div className="space-y-4 p-4">
      <h3 className="mb-2 text-lg font-medium">Panel Inspector</h3>

      <Dropdown
        label="Variant"
        value={data.variant}
        onChange={updateVariant}
        options={VARIANT_OPTIONS}
      />

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Title</label>
        <Input
          value={data.title}
          onChange={updateTitle}
          placeholder="Panel Title"
        />
      </div>
    </div>
  );
};
