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
import {
  $isVideoBlockNode,
  VideoProvider,
  VideoBlockAlignment,
} from './VideoBlockNode';
import { useMediaContext } from '../../EditorProvider';
import { Loader2, AlertCircle, Upload } from 'lucide-react';
import { MediaResizer } from '../../components/MediaResizer';
import { MediaFloatingToolbar } from '../../components/MediaFloatingToolbar';
import {
  getImageLayoutClass,
  getImageContainerStyle,
} from '../ImageBlockNode/image-layout-utils';

export interface VideoBlockComponentProps {
  src: string;
  provider?: VideoProvider;
  title?: string;
  status?: 'uploading' | 'uploaded' | 'error';
  width?: number;
  height?: number;
  layout?: 'inline' | 'breakout' | 'fullWidth';
  alignment?: VideoBlockAlignment;
  nodeKey: NodeKey;
}

export function VideoBlockComponent({
  src,
  provider = 'html5',
  title,
  status,
  width,
  height,
  layout,
  alignment,
  nodeKey,
}: VideoBlockComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelected] =
    useLexicalNodeSelection(nodeKey);
  const videoRef = useRef<HTMLVideoElement | HTMLIFrameElement>(null);
  const componentRef = useRef<HTMLDivElement>(null);
  const resizableContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaConfig = useMediaContext();

  // Store file reference for retry
  const pendingFileRef = useRef<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDelete = useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isVideoBlockNode($getNodeByKey(nodeKey))) {
        payload.preventDefault();
        const node = $getNodeByKey(nodeKey);
        if ($isVideoBlockNode(node)) {
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
            event.target === videoRef.current ||
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

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (event.shiftKey) {
      setSelected(!isSelected);
    } else {
      clearSelected();
      setSelected(true);
    }
  };

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
        if ($isVideoBlockNode(node)) {
          const writable = node.getWritable();
          writable.__src = previewUrl;
          writable.__status = 'uploading';
          writable.__provider = 'html5'; // Local files are always html5
        }
      });

      // Notify start
      mediaConfig.callbacks?.onUploadStart?.(file, 'video');

      try {
        const result = await mediaConfig.uploadAdapter.uploadFile(file, {
          onProgress: (progress) => {
            setUploadProgress(progress);
            mediaConfig.callbacks?.onUploadProgress?.(file, progress);
          },
        });

        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if ($isVideoBlockNode(node)) {
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
          if ($isVideoBlockNode(node)) {
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
      mediaConfig.allowedVideoTypes &&
      !mediaConfig.allowedVideoTypes.includes(file.type)
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

  const handleRemove = useCallback(() => {
    pendingFileRef.current = null;
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isVideoBlockNode(node)) {
        node.remove();
      }
    });
  }, [editor, nodeKey]);

  // Show upload UI when no src is provided
  if (!src) {
    return (
      <Card
        className={`p-8 w-full max-w-3xl mx-auto flex flex-col items-center gap-4 border-dashed cursor-pointer hover:border-primary transition-colors ${
          isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
        }`}
        onClick={handleClick}
      >
        <Upload className="h-12 w-12 text-muted-foreground" />
        <div className="text-muted-foreground text-sm text-center">
          No video source provided
        </div>
        {mediaConfig?.uploadAdapter?.uploadFile && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept={mediaConfig.allowedVideoTypes?.join(',')}
              onChange={handleUpload}
              className="sr-only"
              data-testid="video-upload-input"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium"
            >
              Upload Video
            </button>
          </>
        )}
      </Card>
    );
  }

  const renderVideo = () => {
    if (provider === 'html5') {
      return (
        <video
          ref={videoRef as React.RefObject<HTMLVideoElement>}
          src={src}
          controls
          className={`w-full h-full rounded-md ${status === 'uploading' ? 'opacity-50' : ''}`}
          title={title}
        />
      );
    }

    let embedSrc = src;
    if (provider === 'youtube') {
      // Simple conversion for youtube watch URLs to embed
      if (src.includes('watch?v=')) {
        embedSrc = src.replace('watch?v=', 'embed/');
      } else if (src.includes('youtu.be/')) {
        embedSrc = src.replace('youtu.be/', 'youtube.com/embed/');
      }
    } else if (provider === 'vimeo') {
      if (!src.includes('player.vimeo.com')) {
        // Basic check, real implementation might need regex for vimeo IDs
        const vimeoId = src.split('/').pop();
        if (vimeoId) {
          embedSrc = `https://player.vimeo.com/video/${vimeoId}`;
        }
      }
    }

    return (
      <iframe
        ref={videoRef as React.RefObject<HTMLIFrameElement>}
        src={embedSrc}
        className={`w-full h-full rounded-md ${status === 'uploading' ? 'opacity-50' : ''}`}
        title={title || 'Video player'}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  };

  return (
    <div
      className={`video-block-container group relative ${getImageLayoutClass(layout)}`}
      style={{
        ...getImageContainerStyle(layout),
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
        ref={resizableContainerRef}
        className={`relative inline-block ${isSelected ? 'ring-2 ring-primary ring-offset-2 rounded-md' : ''}`}
        style={{
          width:
            layout === 'fullWidth' || layout === 'breakout'
              ? '100%'
              : width
                ? `${width}px`
                : undefined,
          maxWidth: '100%',
          aspectRatio: !width ? '16/9' : undefined, // Default to 16:9 only if no width set (initial)
        }}
        onClick={handleClick}
      >
        {isSelected && (
          <>
            <MediaFloatingToolbar
              alignment={alignment}
              showLayoutControls={false}
              onAlignmentChange={(newAlignment) => {
                editor.update(() => {
                  const node = $getNodeByKey(nodeKey);
                  if ($isVideoBlockNode(node)) {
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
              mediaRef={resizableContainerRef}
              onWidthChange={(newWidth) => {
                editor.update(() => {
                  const node = $getNodeByKey(nodeKey);
                  if ($isVideoBlockNode(node)) {
                    node.setWidth(newWidth);
                  }
                });
              }}
            />
          </>
        )}

        {renderVideo()}
        {/* Loading overlay for uploading state */}
        {status === 'uploading' && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {/* Overlay to capture clicks for selection when using iframes */}
        {!isSelected && status !== 'uploading' && status !== 'error' && (
          <div
            className="absolute inset-0 cursor-pointer z-10 hover:ring-2 hover:ring-primary/50 hover:ring-offset-1 transition-all"
            style={{ backgroundColor: 'rgba(0,0,0,0.01)' }}
            onClick={handleClick}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          />
        )}

        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 gap-2">
            <p className="text-destructive font-medium">Upload Failed</p>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRetry();
                }}
                className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
              >
                Retry
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded"
              >
                Remove
              </button>
            </div>
            {/* Hidden input for retry fallback if needed */}
            <input
              ref={fileInputRef}
              type="file"
              accept={mediaConfig?.allowedVideoTypes?.join(',')}
              onChange={handleUpload}
              className="sr-only"
            />
          </div>
        )}
      </div>
    </div>
  );
}
