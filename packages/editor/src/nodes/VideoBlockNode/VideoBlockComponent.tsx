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
import { $isVideoBlockNode, VideoProvider } from './VideoBlockNode';
import { useMediaContext } from '../../EditorProvider';
import { Loader2, AlertCircle, Upload } from 'lucide-react';

export interface VideoBlockComponentProps {
  src: string;
  provider?: VideoProvider;
  title?: string;
  status?: 'uploading' | 'uploaded' | 'error';
  nodeKey: NodeKey;
}

export function VideoBlockComponent({
  src,
  provider = 'html5',
  title,
  status,
  nodeKey,
}: VideoBlockComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelected] =
    useLexicalNodeSelection(nodeKey);
  const videoRef = useRef<HTMLVideoElement | HTMLIFrameElement>(null);
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
        () => {
          // Check if click is inside the component but not necessarily on the video/iframe itself
          // Since iframes capture clicks, we might need a wrapper to handle selection
          // For now, we rely on the wrapper div click
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
    if (event.shiftKey) {
      setSelected(!isSelected);
    } else {
      clearSelected();
      setSelected(true);
    }
  };

  const performUpload = useCallback(
    async (file: File) => {
      if (!mediaConfig?.uploadAdapter) return;

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
    if (!file || !mediaConfig?.uploadAdapter) return;

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
        {mediaConfig?.uploadAdapter && (
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

  // Show error state
  if (status === 'error') {
    return (
      <Card
        className={`p-8 w-full max-w-3xl mx-auto flex flex-col items-center gap-4 border-destructive ${
          isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
        }`}
        onClick={handleClick}
      >
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-destructive text-sm">Upload failed</div>
        {mediaConfig?.uploadAdapter && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept={mediaConfig.allowedVideoTypes?.join(',')}
              onChange={handleUpload}
              className="sr-only"
            />
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRetry();
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium"
              >
                Retry
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium"
              >
                Remove
              </button>
            </div>
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
    <div className="video-block-container py-2">
      <Card
        className={`overflow-hidden transition-all duration-200 relative ${
          isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
        } w-full max-w-3xl mx-auto aspect-video`}
        onClick={handleClick}
      >
        {renderVideo()}
        {/* Loading overlay for uploading state */}
        {status === 'uploading' && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {/* Overlay to capture clicks for selection when using iframes */}
        {!isSelected && status !== 'uploading' && (
          <div
            className="absolute inset-0 bg-transparent cursor-pointer"
            onClick={handleClick}
          />
        )}
      </Card>
    </div>
  );
}
