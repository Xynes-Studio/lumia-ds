import React, { useCallback, useEffect, useState } from 'react';
import { NodeKey } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Input, Select, Slider } from '@lumia/components';
import { $getNodeByKey } from 'lexical';
import { $isImageBlockNode } from './ImageBlockNode';

export const ImageBlockInspector: React.FC<{ nodeKey: NodeKey }> = ({
  nodeKey,
}) => {
  const [editor] = useLexicalComposerContext();
  const [data, setData] = useState({
    alt: '',
    layout: 'inline',
    width: 0,
  });

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageBlockNode(node)) {
          setData({
            alt: node.__alt || '',
            layout: node.__layout || 'inline', // Force cast or ensure type matches
            width: node.__width || 0,
          });
        }
      });
    });
  }, [editor, nodeKey]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageBlockNode(node)) {
        setData({
          alt: node.__alt || '',
          layout: node.__layout || 'inline',
          width: node.__width || 0,
        });
      }
    });
  }, [editor, nodeKey]);

  const updateAlt = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newAlt = e.target.value;
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageBlockNode(node)) {
          node.setAlt(newAlt);
        }
      });
    },
    [editor, nodeKey],
  );

  const updateLayout = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      // Cast string to union type
      const newLayout = e.target.value as 'inline' | 'breakout' | 'fullWidth';
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageBlockNode(node)) {
          node.setLayout(newLayout);
        }
      });
    },
    [editor, nodeKey],
  );

  const updateWidth = useCallback(
    (val: number) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageBlockNode(node)) {
          node.setWidth(val);
        }
      });
    },
    [editor, nodeKey],
  );

  return (
    <div className="space-y-4 p-4">
      <h3 className="mb-2 text-lg font-medium">Image Inspector</h3>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Alt Text</label>
        <Input
          value={data.alt}
          onChange={updateAlt}
          placeholder="Descriptive text"
        />
      </div>

      <Select label="Layout" value={data.layout} onChange={updateLayout}>
        <option value="inline">Inline</option>
        <option value="breakout">Breakout</option>
        <option value="fullWidth">Full Width</option>
      </Select>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Width</label>
        <Slider
          min={0}
          max={100}
          step={1}
          value={data.width}
          onChange={updateWidth}
          showValue
        />
      </div>
    </div>
  );
};
