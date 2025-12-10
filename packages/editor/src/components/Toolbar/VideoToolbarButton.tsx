import React, { useState, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@lumia/components';
import { Video as VideoIcon } from 'lucide-react';
import { INSERT_VIDEO_BLOCK_COMMAND } from '../../plugins/InsertVideoPlugin';
import { MediaInsertTabs } from '../MediaInsert';
import { useMediaContext } from '../../EditorProvider';
import { $createVideoBlockNode } from '../../nodes/VideoBlockNode';
import { $insertNodeToNearestRoot } from '@lexical/utils';
import { $createParagraphNode } from 'lexical';

export function VideoToolbarButton() {
  const [editor] = useLexicalComposerContext();
  const [isOpen, setIsOpen] = useState(false);
  const mediaConfig = useMediaContext();

  const handleInsertFromUrl = useCallback(
    (url: string) => {
      editor.dispatchCommand(INSERT_VIDEO_BLOCK_COMMAND, {
        src: url,
      });
      setIsOpen(false);
    },
    [editor],
  );

  const handleInsertFromFile = useCallback(
    (file: File) => {
      if (!mediaConfig?.uploadAdapter) return;

      // Call onUploadStart callback
      mediaConfig.callbacks?.onUploadStart?.(file, 'video');

      // Create node with uploading status and preview
      const previewUrl = URL.createObjectURL(file);

      editor.update(() => {
        const videoNode = $createVideoBlockNode({
          src: previewUrl,
          provider: 'html5', // Local files are always html5
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
            // Call onUploadComplete callback
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
            // Call onUploadError callback
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
          aria-label="Insert Video"
          title="Insert Video"
        >
          <VideoIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start" side="bottom">
        <MediaInsertTabs
          mediaType="video"
          onInsertFromUrl={handleInsertFromUrl}
          onInsertFromFile={handleInsertFromFile}
          onCancel={handleCancel}
          urlPlaceholder="https://youtube.com/watch?v=..."
        />
      </PopoverContent>
    </Popover>
  );
}
