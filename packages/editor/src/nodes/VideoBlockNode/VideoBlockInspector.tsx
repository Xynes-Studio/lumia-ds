import React, { useCallback, useEffect, useState } from 'react';
import { NodeKey } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Input, Select } from '@lumia/components';
import { $getNodeByKey } from 'lexical';
import { $isVideoBlockNode, VideoProvider } from './VideoBlockNode';

export const VideoBlockInspector: React.FC<{ nodeKey: NodeKey }> = ({
  nodeKey,
}) => {
  const [editor] = useLexicalComposerContext();
  const [data, setData] = useState<{
    src: string;
    provider: VideoProvider;
    title: string;
  }>({
    src: '',
    provider: 'youtube',
    title: '',
  });

  useEffect(() => {
    const updateData = () => {
      editor.getEditorState().read(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isVideoBlockNode(node)) {
          setData({
            src: node.__src || '',
            provider: node.__provider || 'youtube',
            title: node.__title || '',
          });
        }
      });
    };

    updateData();

    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isVideoBlockNode(node)) {
          setData({
            src: node.__src || '',
            provider: node.__provider || 'youtube',
            title: node.__title || '',
          });
        }
      });
    });
  }, [editor, nodeKey]);

  const updateSrc = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newSrc = e.target.value;
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isVideoBlockNode(node)) {
          node.setSrc(newSrc);
        }
      });
    },
    [editor, nodeKey],
  );

  const updateProvider = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newProvider = e.target.value as VideoProvider;
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isVideoBlockNode(node)) {
          node.setProvider(newProvider);
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
        if ($isVideoBlockNode(node)) {
          node.setTitle(newTitle);
        }
      });
    },
    [editor, nodeKey],
  );

  return (
    <div className="space-y-4 p-4">
      <h3 className="mb-2 text-lg font-medium">Video Inspector</h3>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">URL</label>
        <Input
          value={data.src}
          onChange={updateSrc}
          placeholder="https://..."
        />
      </div>

      <Select label="Provider" value={data.provider} onChange={updateProvider}>
        <option value="youtube">YouTube</option>
        <option value="vimeo">Vimeo</option>
        <option value="loom">Loom</option>
        <option value="html5">HTML5</option>
      </Select>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Title</label>
        <Input
          value={data.title}
          onChange={updateTitle}
          placeholder="Video Title"
        />
      </div>
    </div>
  );
};
