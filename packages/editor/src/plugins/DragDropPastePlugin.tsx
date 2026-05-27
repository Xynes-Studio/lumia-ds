import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_HIGH,
  DROP_COMMAND,
  PASTE_COMMAND,
  $getNodeByKey,
} from 'lexical';
import { useEffect } from 'react';
import { useMediaContext } from '../EditorProvider';
import {
  $createImageBlockNode,
  $isImageBlockNode,
} from '../nodes/ImageBlockNode/ImageBlockNode';
import {
  $createVideoBlockNode,
  $isVideoBlockNode,
} from '../nodes/VideoBlockNode/VideoBlockNode';
import {
  $createFileBlockNode,
  $isFileBlockNode,
} from '../nodes/FileBlockNode/FileBlockNode';
import { $wrapNodeInElement, mergeRegister } from '@lexical/utils';

export function DragDropPastePlugin(): null {
  const [editor] = useLexicalComposerContext();
  const mediaConfig = useMediaContext();

  useEffect(() => {
    if (!mediaConfig?.uploadAdapter?.uploadFile) {
      return;
    }

    const handleMedia = async (file: File) => {
      // Validate size
      if (
        mediaConfig.maxFileSizeMB &&
        file.size > mediaConfig.maxFileSizeMB * 1024 * 1024
      ) {
        alert(`File size exceeds ${mediaConfig.maxFileSizeMB}MB`);
        return;
      }

      mediaConfig.callbacks?.onUploadStart?.(
        file,
        file.type.startsWith('image/')
          ? 'image'
          : file.type.startsWith('video/')
            ? 'video'
            : 'file',
      );

      // STORAGE-11 bugfix: Lexical's `editor.update()` is queued (not always
      // synchronous from inside a command handler — `discrete: true` is only
      // synchronous OUTSIDE an active update cycle, and PASTE_COMMAND
      // callbacks run inside one). So we capture `nodeKey` from a mutable
      // container and fire the actual upload from `onUpdate`, which Lexical
      // guarantees runs AFTER the optimistic node has committed.
      const previewUrl = URL.createObjectURL(file);
      const nodeKeyRef: { current: string | null } = { current: null };

      const runUploadAfterCommit = async () => {
        const nodeKey = nodeKeyRef.current;
        if (!nodeKey || !mediaConfig?.uploadAdapter) {
          return;
        }

        try {
          const result = await mediaConfig.uploadAdapter.uploadFile(file, {
            onProgress: (progress) => {
              mediaConfig.callbacks?.onUploadProgress?.(file, progress);
            },
          });

          editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if (!node) return;

            if ($isImageBlockNode(node)) {
              const writable = node.getWritable();
              writable.__src = result.url;
              writable.__status = 'uploaded';
              // STORAGE-11 bugfix: persist `objectId` from the adapter result
              // so `stripTransientImageUrls(body)` on save can strip the
              // transient signed URL — the saved entry body must never carry
              // the signed R2/B2/e2 URL. Mirrors
              // `ImageBlockComponent.performUpload`.
              if (
                typeof result.objectId === 'string' &&
                result.objectId.length > 0
              ) {
                writable.__objectId = result.objectId;
              }
            } else if ($isVideoBlockNode(node)) {
              const writable = node.getWritable();
              writable.__src = result.url;
              writable.__status = 'uploaded';
            } else if ($isFileBlockNode(node)) {
              const writable = node.getWritable();
              writable.__url = result.url;
              writable.__size = result.size;
              writable.__mime = result.mime;
              writable.__status = 'uploaded';
            }
          });

          mediaConfig.callbacks?.onUploadComplete?.(file, result);
          URL.revokeObjectURL(previewUrl);
        } catch (error) {
          console.error('Upload failed', error);
          editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if (node) {
              if ($isImageBlockNode(node)) {
                node.getWritable().__status = 'error';
              } else if ($isVideoBlockNode(node)) {
                node.getWritable().__status = 'error';
              } else if ($isFileBlockNode(node)) {
                node.getWritable().__status = 'error';
              }
            }
          });
          mediaConfig.callbacks?.onUploadError?.(
            file,
            error instanceof Error ? error : new Error('Upload failed'),
          );
        }
      };

      editor.update(
        () => {
          let optimisticNode;
          if (
            mediaConfig.allowedImageTypes &&
            mediaConfig.allowedImageTypes.includes(file.type)
          ) {
            optimisticNode = $createImageBlockNode({
              src: previewUrl,
              alt: file.name,
              status: 'uploading',
            });
          } else if (
            mediaConfig.allowedVideoTypes &&
            mediaConfig.allowedVideoTypes.includes(file.type)
          ) {
            optimisticNode = $createVideoBlockNode({
              src: previewUrl,
              provider: 'html5',
              title: file.name,
              status: 'uploading',
            });
          } else {
            // Default to file block
            optimisticNode = $createFileBlockNode({
              url: previewUrl,
              filename: file.name,
              size: file.size,
              mime: file.type,
              status: 'uploading',
            });
          }

          $insertNodes([optimisticNode]);
          // STORAGE-LIVE-4 bugfix: do NOT call `.selectEnd()` here. The
          // previous code wrapped the node in a paragraph and called
          // `selectEnd()`, which moved the selection to the bottom of the
          // editor. Combined with our post-upload `editor.update()` (which
          // flips `__status` from 'uploading' to 'uploaded' ~1-2s later),
          // every status flip caused Lexical to scroll the selection back
          // into view, hijacking the user's scroll position during the
          // upload window. Just wrap (so the node sits in a block paragraph
          // for layout) without moving the selection.
          if ($isRootOrShadowRoot(optimisticNode.getParentOrThrow())) {
            $wrapNodeInElement(optimisticNode, $createParagraphNode);
          }
          nodeKeyRef.current = optimisticNode.getKey();
        },
        {
          // onUpdate runs AFTER the editor commits the optimistic node, so
          // `nodeKeyRef.current` is guaranteed to be set when we read it.
          onUpdate: () => {
            void runUploadAfterCommit();
          },
        },
      );
    };

    return mergeRegister(
      editor.registerCommand(
        DROP_COMMAND,
        (event) => {
          const files = event.dataTransfer?.files;
          if (files && files.length > 0) {
            event.preventDefault();
            Array.from(files).forEach((file) => handleMedia(file));
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerCommand(
        PASTE_COMMAND,
        (event: ClipboardEvent) => {
          const files = event.clipboardData?.files;
          if (files && files.length > 0) {
            event.preventDefault();
            Array.from(files).forEach((file) => handleMedia(file));
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH,
      ),
    );
  }, [editor, mediaConfig]);

  return null;
}
