import { useEffect, useState } from 'react';
import { LexicalNode, $getRoot, ElementNode, $isElementNode } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isHeadingNode } from '@lexical/rich-text';
import { $isParagraphNode } from 'lexical';
import { $isImageBlockNode, ImageBlockNode } from '../nodes/ImageBlockNode';
import { $isVideoBlockNode, VideoBlockNode } from '../nodes/VideoBlockNode';
import {
  $isFileBlockNode,
  FileBlockNode,
} from '../nodes/FileBlockNode/FileBlockNode';
import {
  $isPanelBlockNode,
  PanelBlockNode,
} from '../nodes/PanelBlockNode/PanelBlockNode';
import { BlockType } from '../blocks/types';

export interface BlockOutlineItem {
  id: string; // node key
  type: BlockType | string;
  label: string;
}

/**
 * Helper to extract a short label from a block node.
 */
function getBlockLabel(node: LexicalNode): string {
  if ($isHeadingNode(node)) {
    return node.getTextContent();
  }
  if ($isParagraphNode(node)) {
    const text = node.getTextContent();
    return text.length > 0 ? text : 'Empty Paragraph';
  }
  if ($isImageBlockNode(node)) {
    return (
      (node as ImageBlockNode).__alt ||
      (node as ImageBlockNode).__caption ||
      'Image'
    );
  }
  if ($isVideoBlockNode(node)) {
    return (node as VideoBlockNode).getTitle() || 'Video';
  }
  if ($isFileBlockNode(node)) {
    return (node as FileBlockNode).__filename || 'File';
  }
  if ($isPanelBlockNode(node)) {
    return (
      (node as PanelBlockNode).getTitle() || node.getTextContent() || 'Panel'
    );
  }

  // Fallback for other nodes
  return node.getTextContent() || node.getType();
}

/**
 * Hook to get the outline of top-level blocks.
 * Throttles updates to avoid performance hit on every keystroke.
 */
export function useBlockOutline(delay = 300) {
  const [editor] = useLexicalComposerContext();
  const [blocks, setBlocks] = useState<BlockOutlineItem[]>([]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const updateBlocks = () => {
      editor.getEditorState().read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const newBlocks: BlockOutlineItem[] = [];

        children.forEach((child) => {
          const type = child.getType();
          const label = getBlockLabel(child);
          const snippet =
            label.length > 30 ? label.slice(0, 30) + '...' : label;

          newBlocks.push({
            id: child.getKey(),
            type,
            label: snippet,
          });
        });

        // Simple comparison to avoid unnecessary state updates if strictly needed,
        // but considering the content changes often, simple set may be fine.
        // We can optimize if needed.
        setBlocks(newBlocks);
      });
    };

    // Initial load
    updateBlocks();

    // Subscribe to updates
    const removeListener = editor.registerUpdateListener(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateBlocks, delay);
    });

    return () => {
      removeListener();
      clearTimeout(timeoutId);
    };
  }, [editor, delay]);

  return blocks;
}
