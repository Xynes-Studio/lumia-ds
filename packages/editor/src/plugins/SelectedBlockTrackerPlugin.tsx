import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  ElementNode,
  LexicalNode,
} from 'lexical';
import { useInternalEditorContext } from '../EditorProvider';

/**
 * Finds the top-level block node (direct child of RootNode) from the given node.
 * If the node is already a top-level block, returns it.
 * If the node is nested, traverses up.
 */
export function getTopLevelBlockNode(node: LexicalNode): LexicalNode | null {
  let currentNode: LexicalNode | null = node;
  while (currentNode !== null) {
    const parent: ElementNode | null = currentNode.getParent();
    if (parent && parent.getType() === 'root') {
      return currentNode;
    }
    currentNode = parent;
  }
  return null;
}

export function SelectedBlockTrackerPlugin() {
  const [editor] = useLexicalComposerContext();
  const { setSelectedBlock } = useInternalEditorContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          const topLevelBlock = getTopLevelBlockNode(anchorNode);

          if (topLevelBlock) {
            setSelectedBlock({
              nodeKey: topLevelBlock.getKey(),
              blockType: topLevelBlock.getType(),
            });
          } else {
            setSelectedBlock(null);
          }
        }
      });
    });
  }, [editor, setSelectedBlock]);

  return null;
}
