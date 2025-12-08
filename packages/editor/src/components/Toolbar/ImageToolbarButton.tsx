import React, { useState, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@lumia/components';
import { Image as ImageIcon } from 'lucide-react';
import { INSERT_IMAGE_BLOCK_COMMAND } from '../../plugins/InsertImagePlugin';
import { MediaInsertTabs } from '../MediaInsert';
import { useMediaContext } from '../../EditorProvider';
import { $createImageBlockNode } from '../../nodes/ImageBlockNode/ImageBlockNode';
import { $insertNodes, $isRootOrShadowRoot } from 'lexical';
import { $wrapNodeInElement } from '@lexical/utils';
import { $createParagraphNode } from 'lexical';

export function ImageToolbarButton() {
  const [editor] = useLexicalComposerContext();
  const [isOpen, setIsOpen] = useState(false);
  const mediaConfig = useMediaContext();

  const handleInsertFromUrl = useCallback(
    (url: string, metadata?: { alt?: string }) => {
      editor.dispatchCommand(INSERT_IMAGE_BLOCK_COMMAND, {
        src: url,
        alt: metadata?.alt || '',
      });
      setIsOpen(false);
    },
    [editor],
  );

  const handleInsertFromFile = useCallback(
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
            // Call onUploadComplete callback
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
            // Call onUploadError callback
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

      setIsOpen(false);
    },
    [editor, mediaConfig],
  );

  const handleCancel = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Insert Image"
          title="Insert Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start" side="bottom">
        <MediaInsertTabs
          mediaType="image"
          onInsertFromUrl={handleInsertFromUrl}
          onInsertFromFile={handleInsertFromFile}
          onCancel={handleCancel}
          showAltText={true}
        />
      </PopoverContent>
    </Popover>
  );
}
