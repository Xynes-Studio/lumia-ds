import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand,
} from 'lexical';
import { useEffect } from 'react';
import {
  $createStatusNode,
  StatusPayload,
} from '../nodes/StatusNode/StatusNode';

export const INSERT_STATUS_COMMAND: LexicalCommand<StatusPayload> =
  createCommand('INSERT_STATUS_COMMAND');

/**
 * InsertStatusPlugin - Handles the INSERT_STATUS_COMMAND to insert StatusNode.
 *
 * The StatusNode is an inline decorator node that displays a status pill.
 * This plugin enables insertion via slash menu or programmatic dispatch.
 */
export function InsertStatusPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        INSERT_STATUS_COMMAND,
        (payload) => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) {
            return false;
          }

          const statusNode = $createStatusNode(payload);
          selection.insertNodes([statusNode]);
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    );
  }, [editor]);

  return null;
}
