/**
 * SlashMenuPlugin - Enables slash command menu for quick insertion of blocks.
 *
 * When user types '/' at the start of a line or after whitespace,
 * a menu appears with available commands that can be filtered by typing.
 *
 * This plugin composes several extracted hooks and components:
 * - useSlashMenuState: State management for menu and modal
 * - useSlashMediaUpload: Upload handlers for media files
 * - useSlashMenuKeyboard: Keyboard event handling
 * - useSlashMenuQuery: Query tracking with editor updates
 * - SlashMenuModal: Modal UI for media insertion
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  $getNodeByKey,
  $isTextNode,
  $isElementNode,
} from 'lexical';
import React, { useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  SlashMenu,
  defaultSlashCommands,
  filterSlashCommands,
  SlashCommand,
} from '../components/SlashMenu';
import { SlashMenuModal } from '../components/SlashMenu/SlashMenuModal';
import type { SlashMenuModalType } from '../components/SlashMenu/SlashMenuModal';
import { useMediaContext } from '../EditorProvider';
import { useSlashMenuState } from '../hooks/useSlashMenuState';
import { useSlashMediaUpload } from '../hooks/useSlashMediaUpload';
import { useSlashMenuKeyboard } from '../hooks/useSlashMenuKeyboard';
import { useSlashMenuQuery } from '../hooks/useSlashMenuQuery';

export function SlashMenuPlugin(): React.ReactElement | null {
  const [editor] = useLexicalComposerContext();
  const {
    menuState,
    modalState,
    openMenu,
    closeMenu,
    updateQuery,
    openModal,
    closeModal,
  } = useSlashMenuState();
  const mediaConfig = useMediaContext();

  // Upload handlers from extracted hook
  const uploadHandlers = useSlashMediaUpload({
    editor,
    mediaConfig,
    onComplete: closeModal,
  });

  // Keyboard event handling for '/' trigger
  useSlashMenuKeyboard({
    editor,
    onOpenMenu: openMenu,
  });

  // Query tracking with editor updates
  useSlashMenuQuery({
    editor,
    isOpen: menuState.isOpen,
    triggerNodeKey: menuState.triggerNodeKey,
    triggerOffset: menuState.triggerOffset,
    onUpdateQuery: updateQuery,
    onClose: closeMenu,
  });

  // Handle command selection (combines with slash removal)
  const handleSelectCommand = useCallback(
    (command: SlashCommand) => {
      const position = { ...menuState.position };

      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return;
        }

        // Remove the slash and query text
        if (menuState.triggerNodeKey) {
          const node = $getNodeByKey(menuState.triggerNodeKey);
          if (node) {
            let textNode = node;
            let offset = menuState.triggerOffset;

            if ($isElementNode(node)) {
              const firstChild = node.getFirstChild();
              if (firstChild && $isTextNode(firstChild)) {
                textNode = firstChild;
                offset = 0;
              }
            }

            if ($isTextNode(textNode)) {
              const textContent = textNode.getTextContent();
              const beforeSlash = textContent.substring(0, offset);
              const afterQuery = textContent.substring(
                offset + 1 + menuState.query.length,
              );
              const trimmed = beforeSlash + afterQuery;
              textNode.setTextContent(trimmed);

              // BUG-LDS-6 follow-up: re-anchor the selection AFTER the
              // text mutation, regardless of whether the trimmed text is
              // empty. The previous behavior only reset selection for
              // the empty case, leaving the old caret offset (which
              // pointed into the now-deleted `/<query>` slice) pointing
              // past the end of the shrunk text node.
              //
              // Symptom of the old behavior: any slash command run on a
              // line that already had non-empty text BEFORE the `/`
              // (e.g. "hello /panel") would crash the downstream insert
              // with `$getTextNodeOffset: invalid offset N for size M`
              // because `$insertNodeToNearestRoot` → `$caretFromPoint`
              // → `$getTextPointCaret` reads the stale offset.
              //
              // We now collapse the caret to `beforeSlash.length`
              // (i.e. the position where the `/` used to be) whenever
              // the text node still has content, and fall back to
              // selecting the parent element for the empty case.
              if (trimmed === '') {
                if ($isElementNode(node)) {
                  node.select();
                } else {
                  textNode.select();
                }
              } else {
                const caret = beforeSlash.length;
                textNode.select(caret, caret);
              }
            }
          }
        }

        closeMenu();
      });

      // Check if command needs modal UI
      if (command.modalType && command.modalType !== 'none') {
        openModal(command.modalType as SlashMenuModalType, position);
      } else {
        command.execute(editor);
      }
    },
    [editor, menuState, closeMenu, openModal],
  );

  // Early return if nothing to render
  if (!menuState.isOpen && !modalState.isOpen) {
    return null;
  }

  const filteredCommands = filterSlashCommands(
    defaultSlashCommands,
    menuState.query,
  );

  return (
    <>
      {menuState.isOpen &&
        createPortal(
          <SlashMenu
            commands={filteredCommands}
            onSelect={handleSelectCommand}
            onClose={closeMenu}
            position={menuState.position}
          />,
          document.body,
        )}
      <SlashMenuModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        position={modalState.position}
        onInsertImageFromUrl={uploadHandlers.handleInsertImageFromUrl}
        onInsertImageFromFile={uploadHandlers.handleInsertImageFromFile}
        onInsertVideoFromUrl={uploadHandlers.handleInsertVideoFromUrl}
        onInsertVideoFromFile={uploadHandlers.handleInsertVideoFromFile}
        onInsertFileFromUrl={uploadHandlers.handleInsertFileFromUrl}
        onInsertFileFromFile={uploadHandlers.handleInsertFileFromFile}
        onClose={closeModal}
      />
    </>
  );
}
