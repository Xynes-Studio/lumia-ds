/**
 * useSlashMediaUpload - Hook for handling media upload from slash menu.
 * Refactored to use pure functions from mediaUploadUtils for testability.
 */
import { useCallback } from 'react';
import { LexicalEditor } from 'lexical';
import {
  $insertNodes,
  $isRootOrShadowRoot,
  $createParagraphNode,
} from 'lexical';
import { $wrapNodeInElement, $insertNodeToNearestRoot } from '@lexical/utils';
import { EditorMediaConfig } from '../media-config';
import { $createImageBlockNode } from '../nodes/ImageBlockNode/ImageBlockNode';
import { $createVideoBlockNode } from '../nodes/VideoBlockNode';
import { $createFileBlockNode } from '../nodes/FileBlockNode/FileBlockNode';
import { INSERT_IMAGE_BLOCK_COMMAND } from '../plugins/InsertImagePlugin';
import { INSERT_VIDEO_BLOCK_COMMAND } from '../plugins/InsertVideoPlugin';
import { INSERT_FILE_BLOCK_COMMAND } from '../plugins/InsertFilePlugin';
import {
  hasUploadAdapter,
  extractFilenameFromUrl,
  createPreviewUrl,
  normalizeUploadError,
  buildSuccessStatusUpdates,
  buildErrorStatusUpdates,
  buildImageNodePayload,
  buildVideoNodePayload,
  buildFileNodePayload,
} from '../utils/mediaUploadUtils';

export interface SlashMediaUploadOptions {
  editor: LexicalEditor;
  mediaConfig: EditorMediaConfig | null;
  onComplete?: () => void;
}

export interface SlashMediaUploadHandlers {
  handleInsertImageFromUrl: (url: string, metadata?: { alt?: string }) => void;
  handleInsertVideoFromUrl: (url: string) => void;
  handleInsertFileFromUrl: (url: string) => void;
  handleInsertImageFromFile: (file: File) => void;
  handleInsertVideoFromFile: (file: File) => void;
  handleInsertFileFromFile: (file: File) => void;
}

/**
 * Updates a node's status after upload completes.
 */
function updateNodeStatus(
  editor: LexicalEditor,
  nodeKey: string,
  nodeType: string,
  updates: Record<string, unknown>,
): void {
  editor.update(() => {
    const node = editor
      .getEditorState()
      .read(() => editor._editorState._nodeMap.get(nodeKey));
    if (node && node.__type === nodeType) {
      const writable = node.getWritable();
      Object.entries(updates).forEach(([key, value]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (writable as any)[key] = value;
      });
    }
  });
}

/**
 * Hook that provides media upload handlers for the slash menu.
 */
export function useSlashMediaUpload({
  editor,
  mediaConfig,
  onComplete,
}: SlashMediaUploadOptions): SlashMediaUploadHandlers {
  // URL-based insertions (dispatch commands)
  const handleInsertImageFromUrl = useCallback(
    (url: string, metadata?: { alt?: string }) => {
      editor.dispatchCommand(INSERT_IMAGE_BLOCK_COMMAND, {
        src: url,
        alt: metadata?.alt || '',
      });
      onComplete?.();
    },
    [editor, onComplete],
  );

  const handleInsertVideoFromUrl = useCallback(
    (url: string) => {
      editor.dispatchCommand(INSERT_VIDEO_BLOCK_COMMAND, {
        src: url,
      });
      onComplete?.();
    },
    [editor, onComplete],
  );

  const handleInsertFileFromUrl = useCallback(
    (url: string) => {
      editor.dispatchCommand(INSERT_FILE_BLOCK_COMMAND, {
        url,
        filename: extractFilenameFromUrl(url),
      });
      onComplete?.();
    },
    [editor, onComplete],
  );

  // File-based insertions (with upload)
  const handleInsertImageFromFile = useCallback(
    (file: File) => {
      if (!hasUploadAdapter(mediaConfig)) return;

      mediaConfig!.callbacks?.onUploadStart?.(file, 'image');

      const previewUrl = createPreviewUrl(file);
      const payload = buildImageNodePayload(previewUrl, file.name);

      editor.update(() => {
        const imageNode = $createImageBlockNode(payload);
        $insertNodes([imageNode]);
        if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
          $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
        }

        const nodeKey = imageNode.getKey();

        mediaConfig!
          .uploadAdapter!.uploadFile(file)
          .then((result) => {
            mediaConfig!.callbacks?.onUploadComplete?.(file, result);
            const updates = buildSuccessStatusUpdates(result, 'image');
            updateNodeStatus(editor, nodeKey, 'image-block', updates);
          })
          .catch((error) => {
            console.error('Upload failed:', error);
            const { error: normalizedError } = normalizeUploadError(error);
            mediaConfig!.callbacks?.onUploadError?.(file, normalizedError);
            updateNodeStatus(
              editor,
              nodeKey,
              'image-block',
              buildErrorStatusUpdates(),
            );
          });
      });

      onComplete?.();
    },
    [editor, mediaConfig, onComplete],
  );

  const handleInsertVideoFromFile = useCallback(
    (file: File) => {
      if (!hasUploadAdapter(mediaConfig)) return;

      mediaConfig!.callbacks?.onUploadStart?.(file, 'video');

      const previewUrl = createPreviewUrl(file);
      const payload = buildVideoNodePayload(previewUrl, file.name);

      editor.update(() => {
        const videoNode = $createVideoBlockNode(payload);

        $insertNodeToNearestRoot(videoNode);

        const paragraphNode = $createParagraphNode();
        videoNode.insertAfter(paragraphNode);
        paragraphNode.select();

        const nodeKey = videoNode.getKey();

        mediaConfig!
          .uploadAdapter!.uploadFile(file)
          .then((result) => {
            mediaConfig!.callbacks?.onUploadComplete?.(file, result);
            const updates = buildSuccessStatusUpdates(result, 'video');
            updateNodeStatus(editor, nodeKey, 'video-block', updates);
          })
          .catch((error) => {
            console.error('Upload failed:', error);
            const { error: normalizedError } = normalizeUploadError(error);
            mediaConfig!.callbacks?.onUploadError?.(file, normalizedError);
            updateNodeStatus(
              editor,
              nodeKey,
              'video-block',
              buildErrorStatusUpdates(),
            );
          });
      });

      onComplete?.();
    },
    [editor, mediaConfig, onComplete],
  );

  const handleInsertFileFromFile = useCallback(
    (file: File) => {
      if (!hasUploadAdapter(mediaConfig)) return;

      mediaConfig!.callbacks?.onUploadStart?.(file, 'file');

      const previewUrl = createPreviewUrl(file);
      const payload = buildFileNodePayload(previewUrl, file);

      editor.update(() => {
        const fileNode = $createFileBlockNode(payload);

        $insertNodes([fileNode]);
        if ($isRootOrShadowRoot(fileNode.getParentOrThrow())) {
          $wrapNodeInElement(fileNode, $createParagraphNode).selectEnd();
        }

        const nodeKey = fileNode.getKey();

        mediaConfig!
          .uploadAdapter!.uploadFile(file, {
            onProgress: (progress) => {
              mediaConfig!.callbacks?.onUploadProgress?.(file, progress);
            },
          })
          .then((result) => {
            mediaConfig!.callbacks?.onUploadComplete?.(file, result);
            const updates = buildSuccessStatusUpdates(result, 'file');
            updateNodeStatus(editor, nodeKey, 'file-block', updates);
          })
          .catch((error) => {
            console.error('Upload failed:', error);
            const { error: normalizedError } = normalizeUploadError(error);
            mediaConfig!.callbacks?.onUploadError?.(file, normalizedError);
            updateNodeStatus(
              editor,
              nodeKey,
              'file-block',
              buildErrorStatusUpdates(),
            );
          });
      });

      onComplete?.();
    },
    [editor, mediaConfig, onComplete],
  );

  return {
    handleInsertImageFromUrl,
    handleInsertVideoFromUrl,
    handleInsertFileFromUrl,
    handleInsertImageFromFile,
    handleInsertVideoFromFile,
    handleInsertFileFromFile,
  };
}
