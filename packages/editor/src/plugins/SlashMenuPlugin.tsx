import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  KEY_DOWN_COMMAND,
  $getNodeByKey,
  $isTextNode,
} from 'lexical';
import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  SlashMenu,
  defaultSlashCommands,
  filterSlashCommands,
  SlashCommand,
} from '../components/SlashMenu';

interface SlashMenuState {
  isOpen: boolean;
  query: string;
  position: { top: number; left: number };
  triggerNodeKey: string | null;
  triggerOffset: number;
}

const initialState: SlashMenuState = {
  isOpen: false,
  query: '',
  position: { top: 0, left: 0 },
  triggerNodeKey: null,
  triggerOffset: 0,
};

/**
 * SlashMenuPlugin - Enables slash command menu for quick insertion of blocks.
 *
 * When user types '/' at the start of a line or after whitespace,
 * a menu appears with available commands that can be filtered by typing.
 */
export function SlashMenuPlugin(): React.ReactElement | null {
  const [editor] = useLexicalComposerContext();
  const [menuState, setMenuState] = useState<SlashMenuState>(initialState);

  const closeMenu = useCallback(() => {
    setMenuState(initialState);
  }, []);

  const handleSelectCommand = useCallback(
    (command: SlashCommand) => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return;
        }

        // Remove the slash and query text
        if (menuState.triggerNodeKey) {
          const node = $getNodeByKey(menuState.triggerNodeKey);
          if (node && $isTextNode(node)) {
            const textContent = node.getTextContent();
            const beforeSlash = textContent.substring(
              0,
              menuState.triggerOffset,
            );
            const afterQuery = textContent.substring(
              menuState.triggerOffset + 1 + menuState.query.length,
            );
            node.setTextContent(beforeSlash + afterQuery);

            // If the node is now empty, select it
            if (beforeSlash + afterQuery === '') {
              node.select();
            }
          }
        }

        closeMenu();
      });

      // Execute the command after closing the menu
      command.execute(editor);
    },
    [editor, menuState, closeMenu],
  );

  useEffect(() => {
    const removeKeyDownListener = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        // Check for '/' key
        if (event.key === '/') {
          const selection = $getSelection();
          if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
            return false;
          }

          const anchor = selection.anchor;
          const anchorNode = anchor.getNode();

          // Only trigger at the start of a line or after whitespace
          if ($isTextNode(anchorNode)) {
            const textContent = anchorNode.getTextContent();
            const offset = anchor.offset;

            // Check if at start or after whitespace
            const isAtStart = offset === 0;
            const isAfterWhitespace =
              offset > 0 && /\s/.test(textContent[offset - 1]);

            if (isAtStart || isAfterWhitespace) {
              // Get cursor position for menu placement
              const domSelection = window.getSelection();
              if (domSelection && domSelection.rangeCount > 0) {
                const range = domSelection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                setMenuState({
                  isOpen: true,
                  query: '',
                  position: {
                    top: rect.bottom + 4,
                    left: rect.left,
                  },
                  triggerNodeKey: anchorNode.getKey(),
                  triggerOffset: offset,
                });
              }
            }
          }
        }

        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    return () => {
      removeKeyDownListener();
    };
  }, [editor]);

  // Listen for text changes to update query
  useEffect(() => {
    if (!menuState.isOpen) {
      return;
    }

    const removeUpdateListener = editor.registerUpdateListener(
      ({ editorState }) => {
        editorState.read(() => {
          if (!menuState.triggerNodeKey) {
            return;
          }

          const node = $getNodeByKey(menuState.triggerNodeKey);
          if (!node || !$isTextNode(node)) {
            closeMenu();
            return;
          }

          const textContent = node.getTextContent();
          const slashIndex = menuState.triggerOffset;

          // Check if slash is still there
          if (textContent[slashIndex] !== '/') {
            closeMenu();
            return;
          }

          // Extract query after the slash
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) {
            closeMenu();
            return;
          }

          const anchor = selection.anchor;
          if (anchor.getNode().getKey() !== menuState.triggerNodeKey) {
            closeMenu();
            return;
          }

          const currentOffset = anchor.offset;
          const query = textContent.substring(slashIndex + 1, currentOffset);

          // Close if user moved before the slash or typed space
          if (currentOffset <= slashIndex || query.includes(' ')) {
            closeMenu();
            return;
          }

          setMenuState((prev) => ({ ...prev, query }));
        });
      },
    );

    return () => {
      removeUpdateListener();
    };
  }, [
    editor,
    menuState.isOpen,
    menuState.triggerNodeKey,
    menuState.triggerOffset,
    closeMenu,
  ]);

  if (!menuState.isOpen) {
    return null;
  }

  const filteredCommands = filterSlashCommands(
    defaultSlashCommands,
    menuState.query,
  );

  return createPortal(
    <SlashMenu
      commands={filteredCommands}
      onSelect={handleSelectCommand}
      onClose={closeMenu}
      position={menuState.position}
    />,
    document.body,
  );
}
