import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils';
import {
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand,
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
          const panelNode = $createPanelBlockNode(payload);
          $insertNodeToNearestRoot(panelNode);
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    );
  }, [editor]);

  return null;
}
