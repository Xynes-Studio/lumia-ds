import { useCallback, useRef, useState } from 'react';
import { LexicalEditor, $getNodeByKey } from 'lexical';
import { $isImageBlockNode } from '../nodes/ImageBlockNode/ImageBlockNode';
import { $isVideoBlockNode } from '../nodes/VideoBlockNode';
import { EditorMediaConfig } from '../media-config';

type MediaType = 'image' | 'video';

interface UploadState {
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: Error;
}

interface UseMediaUploadOptions {
  editor: LexicalEditor;
  mediaConfig: EditorMediaConfig | null;
  nodeKey: string;
  mediaType: MediaType;
}

interface UseMediaUploadResult {
  /** Current upload state */
  state: UploadState;
  /** Start upload for a file */
  upload: (file: File) => Promise<void>;
  /** Retry the last failed upload */
  retry: () => Promise<void>;
  /** Cancel current upload (if supported) and remove node */
  cancel: () => void;
  /** Whether there's a pending file that can be retried */
  canRetry: boolean;
}

/**
 * Hook for handling media upload with proper error handling,
 * progress tracking, and retry support.
 */
export function useMediaUpload({
  editor,
  mediaConfig,
  nodeKey,
  mediaType,
}: UseMediaUploadOptions): UseMediaUploadResult {
  const [state, setState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
  });

  // Store file reference for retry
  const pendingFileRef = useRef<File | null>(null);

  const updateNodeStatus = useCallback(
    (status: 'uploading' | 'uploaded' | 'error', src?: string) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (!node) return;

        if (mediaType === 'image' && $isImageBlockNode(node)) {
          const writable = node.getWritable();
          writable.__status = status;
          if (src) writable.__src = src;
        } else if (mediaType === 'video' && $isVideoBlockNode(node)) {
          const writable = node.getWritable();
          writable.__status = status;
          if (src) writable.__src = src;
        }
      });
    },
    [editor, nodeKey, mediaType],
  );

  const upload = useCallback(
    async (file: File) => {
      if (!mediaConfig?.uploadAdapter) {
        const error = new Error('No upload adapter configured');
        setState({ status: 'error', progress: 0, error });
        mediaConfig?.callbacks?.onUploadError?.(file, error);
        return;
      }

      // Store file for potential retry
      pendingFileRef.current = file;

      // Set optimistic preview
      const previewUrl = URL.createObjectURL(file);
      updateNodeStatus('uploading', previewUrl);

      setState({ status: 'uploading', progress: 0 });
      mediaConfig.callbacks?.onUploadStart?.(file, mediaType);

      try {
        const result = await mediaConfig.uploadAdapter.uploadFile(file, {
          onProgress: (progress) => {
            setState((prev) => ({ ...prev, progress }));
            mediaConfig.callbacks?.onUploadProgress?.(file, progress);
          },
        });

        // Update node with final URL
        updateNodeStatus('uploaded', result.url);

        setState({ status: 'success', progress: 100 });
        mediaConfig.callbacks?.onUploadComplete?.(file, result);

        // Clear pending file on success
        pendingFileRef.current = null;

        // Revoke blob URL to free memory
        URL.revokeObjectURL(previewUrl);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Upload failed');

        updateNodeStatus('error');

        setState({ status: 'error', progress: 0, error });
        mediaConfig.callbacks?.onUploadError?.(file, error);

        console.error('Upload failed:', error);
      }
    },
    [mediaConfig, mediaType, updateNodeStatus],
  );

  const retry = useCallback(async () => {
    const file = pendingFileRef.current;
    if (!file) {
      console.warn('No pending file to retry');
      return;
    }

    await upload(file);
  }, [upload]);

  const cancel = useCallback(() => {
    pendingFileRef.current = null;
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node) {
        node.remove();
      }
    });
    setState({ status: 'idle', progress: 0 });
  }, [editor, nodeKey]);

  return {
    state,
    upload,
    retry,
    cancel,
    canRetry: pendingFileRef.current !== null && state.status === 'error',
  };
}
