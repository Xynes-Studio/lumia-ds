import type { NodeKey } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import {
  $getNodeByKey,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_DELETE_COMMAND,
  KEY_BACKSPACE_COMMAND,
} from 'lexical';
import * as React from 'react';
import { useEffect, useRef, useCallback, useState } from 'react';
import { Card } from '@lumia/components';
import { $isImageBlockNode } from './ImageBlockNode';
import type { ImageBlockAlignment } from './ImageBlockNode';
import { useMediaContext } from '../../EditorProvider';
import { MediaResizer } from '../../components/MediaResizer';
import { MediaFloatingToolbar } from '../../components/MediaFloatingToolbar';
import {
  getImageLayoutClass,
  getImageContainerStyle,
} from './image-layout-utils';

export interface ImageBlockComponentProps {
  src: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  nodeKey: NodeKey;
  status?: 'uploading' | 'uploaded' | 'error';
  layout?: 'inline' | 'breakout' | 'fullWidth';
  alignment?: ImageBlockAlignment;
}

export function ImageBlockComponent({
  src,
  alt,
  caption,
  width,
  height,
  nodeKey,
  status,
  layout,
  alignment,
}: ImageBlockComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelected] =
    useLexicalNodeSelection(nodeKey);
  const imageRef = useRef<HTMLImageElement>(null);
  const componentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaConfig = useMediaContext();

  // Store file reference for retry
  const pendingFileRef = useRef<File | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDelete = useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isImageBlockNode($getNodeByKey(nodeKey))) {
        const event: KeyboardEvent = payload;
        event.preventDefault();
        const node = $getNodeByKey(nodeKey);
        if ($isImageBlockNode(node)) {
          node.remove();
        }
        return true;
      }
      return false;
    },
    [isSelected, nodeKey],
  );

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          if (
            event.target === imageRef.current ||
            componentRef.current?.contains(event.target as Node)
          ) {
            if (event.shiftKey) {
              setSelected(!isSelected);
            } else {
              clearSelected();
              setSelected(true);
            }
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [clearSelected, editor, isSelected, onDelete, setSelected]);

  const performUpload = useCallback(
    async (file: File) => {
      if (!mediaConfig?.uploadAdapter?.uploadFile) return;

      // Store file for potential retry
      pendingFileRef.current = file;
      setUploadProgress(0);

      // Optimistic preview
      const previewUrl = URL.createObjectURL(file);
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageBlockNode(node)) {
          const writable = node.getWritable();
          writable.__src = previewUrl;
          writable.__status = 'uploading';
        }
      });

      // Notify start
      mediaConfig.callbacks?.onUploadStart?.(file, 'image');

      try {
        const result = await mediaConfig.uploadAdapter.uploadFile(file, {
          onProgress: (progress) => {
            setUploadProgress(progress);
            mediaConfig.callbacks?.onUploadProgress?.(file, progress);
          },
        });

        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if ($isImageBlockNode(node)) {
            const writable = node.getWritable();
            writable.__src = result.url;
            writable.__status = 'uploaded';
          }
        });

        mediaConfig.callbacks?.onUploadComplete?.(file, result);

        // Clear pending file on success
        pendingFileRef.current = null;

        // Revoke blob URL to free memory
        URL.revokeObjectURL(previewUrl);
      } catch (error) {
        console.error('Upload failed:', error);

        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if ($isImageBlockNode(node)) {
            const writable = node.getWritable();
            writable.__status = 'error';
          }
        });

        mediaConfig.callbacks?.onUploadError?.(
          file,
          error instanceof Error ? error : new Error('Upload failed'),
        );
      }
    },
    [editor, nodeKey, mediaConfig],
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !mediaConfig?.uploadAdapter?.uploadFile) return;

    // Validate type
    if (
      mediaConfig.allowedImageTypes &&
      !mediaConfig.allowedImageTypes.includes(file.type)
    ) {
      alert(`File type ${file.type} not allowed`);
      return;
    }

    // Validate size
    if (
      mediaConfig.maxFileSizeMB &&
      file.size > mediaConfig.maxFileSizeMB * 1024 * 1024
    ) {
      alert(`File size exceeds ${mediaConfig.maxFileSizeMB}MB`);
      return;
    }

    await performUpload(file);
  };

  const handleRetry = useCallback(() => {
    const pendingFile = pendingFileRef.current;
    if (pendingFile) {
      // Retry with stored file
      performUpload(pendingFile);
    } else {
      // Fallback: open file picker if no stored file
      fileInputRef.current?.click();
    }
  }, [performUpload]);

  const handleRemove = () => {
    pendingFileRef.current = null;
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageBlockNode(node)) {
        node.remove();
      }
    });
  };

  const setCaption = (newCaption: string) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageBlockNode(node)) {
        const writable = node.getWritable();
        writable.__caption = newCaption;
      }
    });
  };

  // If no src and no upload adapter, we can't do anything (shouldn't happen if inserted correctly)
  // If no src and upload adapter exists, show upload button
  const showUpload = !src && mediaConfig?.uploadAdapter?.uploadFile;
  const isUploading = status === 'uploading';
  const isError = status === 'error';

  if (showUpload) {
    return (
      <Card className="p-4 w-full max-w-md mx-auto flex flex-col items-center gap-4 border-dashed">
        <div className="text-muted-foreground text-sm">
          Upload an image to display
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={mediaConfig.allowedImageTypes?.join(',')}
          onChange={handleUpload}
          className="sr-only"
          data-testid="file-upload-input"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          Upload Image
        </button>
      </Card>
    );
  }

  // Calculate alignment style for the container

  return (
    <div
      className={`image-block-container group relative ${getImageLayoutClass(layout)}`}
      style={{
        ...getImageContainerStyle(layout),
        // We apply alignment here if it's not handled by the layout class mechanism completely
        // For inline/breakout, flex parent might be better, but margin auto works for block
        display: 'flex',
        flexDirection: 'column',
        alignItems:
          alignment === 'center'
            ? 'center'
            : alignment === 'right'
              ? 'flex-end'
              : 'flex-start',
      }}
      ref={componentRef}
    >
      <div
        className={`relative inline-block ${isSelected ? 'ring-2 ring-primary ring-offset-2 rounded-md' : ''}`}
        style={{ maxWidth: '100%' }} // Ensure it doesn't overflow parent
        data-testid="image-card"
      >
        {isSelected && (
          <>
            <MediaFloatingToolbar
              layout={layout}
              alignment={alignment}
              onLayoutChange={(newLayout) => {
                editor.update(() => {
                  const node = $getNodeByKey(nodeKey);
                  if ($isImageBlockNode(node)) {
                    node.setLayout(newLayout);
                  }
                });
              }}
              onAlignmentChange={(newAlignment) => {
                editor.update(() => {
                  const node = $getNodeByKey(nodeKey);
                  if ($isImageBlockNode(node)) {
                    node.setAlignment(newAlignment);
                  }
                });
              }}
              onDelete={() => {
                editor.update(() => {
                  const node = $getNodeByKey(nodeKey);
                  if (node) {
                    node.remove();
                  }
                });
              }}
            />
            <MediaResizer
              editor={editor}
              mediaRef={imageRef}
              onWidthChange={(width) => {
                editor.update(() => {
                  const node = $getNodeByKey(nodeKey);
                  if ($isImageBlockNode(node)) {
                    node.setWidth(width);
                  }
                });
              }}
            />
          </>
        )}

        <img
          ref={imageRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`max-w-full h-auto block select-none ${isUploading ? 'opacity-50' : ''
            }`}
          draggable="false"
          style={{
            width:
              layout === 'fullWidth' || layout === 'breakout'
                ? '100%'
                : width
                  ? `${width}px`
                  : '100%',
            maxWidth: '100%',
          }}
        />

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {isError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 gap-2">
            <p className="text-destructive font-medium">Upload Failed</p>
            <div className="flex gap-2">
              <button
                onClick={handleRetry}
                className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
              >
                Retry
              </button>
              <button
                onClick={handleRemove}
                className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        className="mt-2 w-full max-w-[calc(100%-1rem)]"
        style={{ width: width ? `${width}px` : '100%' }}
      >
        <input
          type="text"
          placeholder="Write a caption..."
          className="w-full text-center text-sm text-muted-foreground bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50"
          value={caption || ''}
          onChange={(e) => setCaption(e.target.value)}
          // Prevent selecting image when clicking caption
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}
