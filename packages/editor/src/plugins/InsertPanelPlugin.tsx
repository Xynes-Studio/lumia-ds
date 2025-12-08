import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils';
import {
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand,
  $createParagraphNode,
} from 'lexical';
import { useEffect } from 'react';
import {
  $createPanelBlockNode,
  PanelBlockPayload,
} from '../nodes/PanelBlockNode/PanelBlockNode';

export const INSERT_PANEL_COMMAND: LexicalCommand<PanelBlockPayload> =
  createCommand('INSERT_PANEL_COMMAND');

export function InsertPanelPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        INSERT_PANEL_COMMAND,
        (payload) => {
          // Ensure icon is set based on variant if not provided
          const finalPayload = {
            ...payload,
            icon: payload.icon || payload.variant,
          };
          const panelNode = $createPanelBlockNode(finalPayload);

          // Create an empty paragraph inside the panel for content
          const paragraphNode = $createParagraphNode();
          panelNode.append(paragraphNode);

          // Insert the panel at the nearest root
          $insertNodeToNearestRoot(panelNode);

          // Select the paragraph inside the panel so user can start typing
          paragraphNode.select();

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    );
  }, [editor]);

  return null;
}
