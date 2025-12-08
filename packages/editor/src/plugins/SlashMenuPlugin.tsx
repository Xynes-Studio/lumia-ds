import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  KEY_DOWN_COMMAND,
  $getNodeByKey,
  $isTextNode,
  $isElementNode,
  $insertNodes,
  $isRootOrShadowRoot,
  $createParagraphNode,
} from 'lexical';
import { $wrapNodeInElement, $insertNodeToNearestRoot } from '@lexical/utils';
import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  SlashMenu,
  defaultSlashCommands,
  filterSlashCommands,
  SlashCommand,
  SlashCommandModalType,
} from '../components/SlashMenu';
import { MediaInsertTabs } from '../components/MediaInsert';
import { useMediaContext } from '../EditorProvider';
import { INSERT_IMAGE_BLOCK_COMMAND } from './InsertImagePlugin';
import { INSERT_VIDEO_BLOCK_COMMAND } from './InsertVideoPlugin';
import { $createImageBlockNode } from '../nodes/ImageBlockNode/ImageBlockNode';
import { $createVideoBlockNode } from '../nodes/VideoBlockNode';

interface SlashMenuState {
  isOpen: boolean;
  query: string;
  position: { top: number; left: number };
  triggerNodeKey: string | null;
  triggerOffset: number;
}

interface ModalState {
  isOpen: boolean;
  type: SlashCommandModalType | null;
  position: { top: number; left: number };
}

const initialState: SlashMenuState = {
  isOpen: false,
  query: '',
  position: { top: 0, left: 0 },
  triggerNodeKey: null,
  triggerOffset: 0,
};

const initialModalState: ModalState = {
  isOpen: false,
  type: null,
  position: { top: 0, left: 0 },
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
  const [modalState, setModalState] = useState<ModalState>(initialModalState);
  const mediaConfig = useMediaContext();

  const closeMenu = useCallback(() => {
    setMenuState(initialState);
  }, []);

  const closeModal = useCallback(() => {
    setModalState(initialModalState);
  }, []);

  const handleSelectCommand = useCallback(
    (command: SlashCommand) => {
      // Store position for modal if needed
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

            // If trigger was on element node, find the first text child
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
              textNode.setTextContent(beforeSlash + afterQuery);

              // If the node is now empty, select the parent element
              if (beforeSlash + afterQuery === '') {
                if ($isElementNode(node)) {
                  node.select();
                } else {
                  textNode.select();
                }
              }
            }
          }
        }

        closeMenu();
      });

      // Check if command needs modal UI
      if (command.modalType && command.modalType !== 'none') {
        setModalState({
          isOpen: true,
          type: command.modalType,
          position,
        });
      } else {
        // Execute the command directly
        command.execute(editor);
      }
    },
    [editor, menuState, closeMenu],
  );

  const handleInsertImageFromUrl = useCallback(
    (url: string, metadata?: { alt?: string }) => {
      editor.dispatchCommand(INSERT_IMAGE_BLOCK_COMMAND, {
        src: url,
        alt: metadata?.alt || '',
      });
      closeModal();
    },
    [editor, closeModal],
  );

  const handleInsertVideoFromUrl = useCallback(
    (url: string) => {
      editor.dispatchCommand(INSERT_VIDEO_BLOCK_COMMAND, {
        src: url,
      });
      closeModal();
    },
    [editor, closeModal],
  );

  const handleInsertImageFromFile = useCallback(
    (file: File) => {
      if (!mediaConfig?.uploadAdapter) return;

      // Call onUploadStart callback
      mediaConfig.callbacks?.onUploadStart?.(file, 'image');

      // Create node with uploading status
      const previewUrl = URL.createObjectURL(file);

      editor.update(() => {
        const imageNode = $createImageBlockNode({
          src: previewUrl,
          alt: file.name,
          status: 'uploading',
        });
        $insertNodes([imageNode]);
        if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
          $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
        }

        const nodeKey = imageNode.getKey();

        // Start upload
        mediaConfig
          .uploadAdapter!.uploadFile(file)
          .then((result) => {
            mediaConfig.callbacks?.onUploadComplete?.(file, result);

            editor.update(() => {
              const node = editor
                .getEditorState()
                .read(() => editor._editorState._nodeMap.get(nodeKey));
              if (node && node.__type === 'image-block') {
                const writable = node.getWritable();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (writable as any).__src = result.url;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (writable as any).__status = 'uploaded';
              }
            });
          })
          .catch((error) => {
            console.error('Upload failed:', error);
            mediaConfig.callbacks?.onUploadError?.(
              file,
              error instanceof Error ? error : new Error('Upload failed'),
            );

            editor.update(() => {
              const node = editor
                .getEditorState()
                .read(() => editor._editorState._nodeMap.get(nodeKey));
              if (node && node.__type === 'image-block') {
                const writable = node.getWritable();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (writable as any).__status = 'error';
              }
            });
          });
      });

      closeModal();
    },
    [editor, mediaConfig, closeModal],
  );

  const handleInsertVideoFromFile = useCallback(
    (file: File) => {
      if (!mediaConfig?.uploadAdapter) return;

      // Call onUploadStart callback
      mediaConfig.callbacks?.onUploadStart?.(file, 'video');

      // Create node with uploading status and preview
      const previewUrl = URL.createObjectURL(file);

      editor.update(() => {
        const videoNode = $createVideoBlockNode({
          src: previewUrl,
          provider: 'html5',
          title: file.name,
          status: 'uploading',
        });

        $insertNodeToNearestRoot(videoNode);

        const paragraphNode = $createParagraphNode();
        videoNode.insertAfter(paragraphNode);
        paragraphNode.select();

        const nodeKey = videoNode.getKey();

        // Start upload
        mediaConfig
          .uploadAdapter!.uploadFile(file)
          .then((result) => {
            mediaConfig.callbacks?.onUploadComplete?.(file, result);

            editor.update(() => {
              const node = editor
                .getEditorState()
                .read(() => editor._editorState._nodeMap.get(nodeKey));
              if (node && node.__type === 'video-block') {
                const writable = node.getWritable();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (writable as any).__src = result.url;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (writable as any).__status = 'uploaded';
              }
            });
          })
          .catch((error) => {
            console.error('Upload failed:', error);
            mediaConfig.callbacks?.onUploadError?.(
              file,
              error instanceof Error ? error : new Error('Upload failed'),
            );

            editor.update(() => {
              const node = editor
                .getEditorState()
                .read(() => editor._editorState._nodeMap.get(nodeKey));
              if (node && node.__type === 'video-block') {
                const writable = node.getWritable();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (writable as any).__status = 'error';
              }
            });
          });
      });

      closeModal();
    },
    [editor, mediaConfig, closeModal],
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
          } else if ($isElementNode(anchorNode) && anchor.offset === 0) {
            // Handle empty element nodes (e.g., empty paragraphs)
            // When the cursor is in an empty paragraph, the anchor is the paragraph itself
            const domSelection = window.getSelection();
            if (domSelection && domSelection.rangeCount > 0) {
              const range = domSelection.getRangeAt(0);
              const rect = range.getBoundingClientRect();

              // For empty elements, we need to get position from the element itself
              // since getBoundingClientRect on an empty range may return 0,0
              let top = rect.bottom + 4;
              let left = rect.left;

              // Fallback: get the element's position if rect is empty
              if (rect.width === 0 && rect.height === 0) {
                const element = editor.getElementByKey(anchorNode.getKey());
                if (element) {
                  const elementRect = element.getBoundingClientRect();
                  top = elementRect.top + 20; // Add some offset for the line height
                  left = elementRect.left;
                }
              }

              setMenuState({
                isOpen: true,
                query: '',
                position: { top, left },
                triggerNodeKey: anchorNode.getKey(),
                triggerOffset: 0,
              });
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
          if (!node) {
            closeMenu();
            return;
          }

          let textNode = node;
          let slashIndex = menuState.triggerOffset;

          // If the trigger was on an element node, find the first text child
          // (Lexical creates a text node when you type in an empty paragraph)
          if ($isElementNode(node)) {
            const firstChild = node.getFirstChild();
            if (!firstChild || !$isTextNode(firstChild)) {
              // No text child yet, menu should stay open waiting for text
              return;
            }
            textNode = firstChild;
            slashIndex = 0; // The slash will be at position 0 in the new text node
          } else if (!$isTextNode(node)) {
            closeMenu();
            return;
          }

          const textContent = textNode.getTextContent();

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
          const anchorNode = anchor.getNode();

          // Check if selection is in the expected node
          // (either the trigger node or its first text child)
          const isInTriggerNode =
            anchorNode.getKey() === menuState.triggerNodeKey;
          const isInTextChild =
            $isTextNode(anchorNode) &&
            anchorNode.getKey() === textNode.getKey();

          if (!isInTriggerNode && !isInTextChild) {
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

  // Render modal popover for media insertion
  const renderModal = () => {
    if (!modalState.isOpen || !modalState.type) return null;

    if (modalState.type === 'media-image') {
      return createPortal(
        <div
          className="slash-menu-modal"
          style={{
            position: 'fixed',
            top: modalState.position.top,
            left: modalState.position.left,
            zIndex: 1000,
          }}
        >
          <div className="bg-background border border-border rounded-lg shadow-lg p-4">
            <MediaInsertTabs
              mediaType="image"
              onInsertFromUrl={handleInsertImageFromUrl}
              onInsertFromFile={handleInsertImageFromFile}
              onCancel={closeModal}
              showAltText={true}
            />
          </div>
        </div>,
        document.body,
      );
    }

    if (modalState.type === 'media-video') {
      return createPortal(
        <div
          className="slash-menu-modal"
          style={{
            position: 'fixed',
            top: modalState.position.top,
            left: modalState.position.left,
            zIndex: 1000,
          }}
        >
          <div className="bg-background border border-border rounded-lg shadow-lg p-4">
            <MediaInsertTabs
              mediaType="video"
              onInsertFromUrl={handleInsertVideoFromUrl}
              onInsertFromFile={handleInsertVideoFromFile}
              onCancel={closeModal}
              urlPlaceholder="https://youtube.com/watch?v=..."
            />
          </div>
        </div>,
        document.body,
      );
    }

    return null;
  };

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
      {renderModal()}
    </>
  );
}
