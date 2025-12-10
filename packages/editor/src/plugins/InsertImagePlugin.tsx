import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $wrapNodeInElement, mergeRegister } from '@lexical/utils';
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand,
} from 'lexical';
import { useEffect } from 'react';
import {
  $createImageBlockNode,
  ImageBlockPayload,
  ImageBlockNode,
} from '../nodes/ImageBlockNode/ImageBlockNode';

export const INSERT_IMAGE_BLOCK_COMMAND: LexicalCommand<ImageBlockPayload> =
  createCommand('INSERT_IMAGE_BLOCK_COMMAND');

export function InsertImagePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ImageBlockNode])) {
      throw new Error(
        'InsertImagePlugin: ImageBlockNode not registered on editor',
      );
    }

    return mergeRegister(
      editor.registerCommand<ImageBlockPayload>(
        INSERT_IMAGE_BLOCK_COMMAND,
        (payload) => {
          const imageNode = $createImageBlockNode(payload);
          $insertNodes([imageNode]);
          if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
            $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
          }
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    );
  }, [editor]);

  return null;
}
