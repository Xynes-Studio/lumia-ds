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
  $createFileBlockNode,
  FileBlockNode,
  FileBlockPayload,
} from '../nodes/FileBlockNode/FileBlockNode';
import { useMediaContext } from '../EditorProvider';

export type InsertFilePayload = FileBlockPayload & {
  file?: File;
};

export const INSERT_FILE_BLOCK_COMMAND: LexicalCommand<InsertFilePayload> =
  createCommand('INSERT_FILE_BLOCK_COMMAND');

export function InsertFilePlugin(): null {
  const [editor] = useLexicalComposerContext();
  const mediaConfig = useMediaContext();

  useEffect(() => {
    if (!editor.hasNodes([FileBlockNode])) {
      throw new Error(
        'InsertFilePlugin: FileBlockNode not registered on editor',
      );
    }

    return mergeRegister(
      editor.registerCommand<InsertFilePayload>(
        INSERT_FILE_BLOCK_COMMAND,
        (payload) => {
          const { file, ...nodePayload } = payload;

          // If we have a file, we want to handle the upload flow
          if (file && mediaConfig?.uploadAdapter) {
            // Call onUploadStart callback
            mediaConfig.callbacks?.onUploadStart?.(file, 'file');

            // Validate size
            if (
              mediaConfig.maxFileSizeMB &&
              file.size > mediaConfig.maxFileSizeMB * 1024 * 1024
            ) {
              alert(`File size exceeds ${mediaConfig.maxFileSizeMB}MB`);
              return true;
            }

            // Create optimistic node
            const previewUrl = URL.createObjectURL(file);
            const fileNode = $createFileBlockNode({
              url: previewUrl,
              filename: file.name,
              size: file.size,
              mime: file.type,
              status: 'uploading',
            });

            $insertNodes([fileNode]);
            if ($isRootOrShadowRoot(fileNode.getParentOrThrow())) {
              $wrapNodeInElement(fileNode, $createParagraphNode).selectEnd();
            }

            // Perform upload with progress callback
            mediaConfig.uploadAdapter
              .uploadFile(file, {
                onProgress: (progress) => {
                  mediaConfig.callbacks?.onUploadProgress?.(file, progress);
                },
              })
              .then((result) => {
                mediaConfig.callbacks?.onUploadComplete?.(file, result);
                editor.update(() => {
                  const writable = fileNode.getWritable();
                  writable.__url = result.url;
                  writable.__filename = file.name;
                  writable.__size = result.size;
                  writable.__mime = result.mime;
                  writable.__status = 'uploaded';
                });
              })
              .catch((error) => {
                console.error('Upload failed:', error);
                mediaConfig.callbacks?.onUploadError?.(
                  file,
                  error instanceof Error ? error : new Error('Upload failed'),
                );
                editor.update(() => {
                  const writable = fileNode.getWritable();
                  writable.__status = 'error';
                });
              });

            return true;
          }

          // Fallback or direct insertion (e.g. from slash command with empty payload)
          const fileNode = $createFileBlockNode(nodePayload);
          $insertNodes([fileNode]);
          if ($isRootOrShadowRoot(fileNode.getParentOrThrow())) {
            $wrapNodeInElement(fileNode, $createParagraphNode).selectEnd();
          }
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    );
  }, [editor, mediaConfig]);

  return null;
}
