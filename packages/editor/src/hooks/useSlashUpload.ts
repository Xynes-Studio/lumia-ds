import { useCallback } from 'react';
import { LexicalEditor, $insertNodes, $isRootOrShadowRoot, $createParagraphNode } from 'lexical';
import { $wrapNodeInElement, $insertNodeToNearestRoot } from '@lexical/utils';
import { $createImageBlockNode } from '../nodes/ImageBlockNode/ImageBlockNode';
import { $createVideoBlockNode } from '../nodes/VideoBlockNode';
import { $createFileBlockNode } from '../nodes/FileBlockNode/FileBlockNode';
import { EditorMediaConfig } from '../media-config';

export interface UploadCallbacks {
    onUploadStart?: (file: File, type: 'image' | 'video' | 'file') => void;
    onUploadProgress?: (file: File, progress: number) => void;
    onUploadComplete?: (file: File, result: { url: string; mime?: string; size?: number }) => void;
    onUploadError?: (file: File, error: Error) => void;
}

/**
 * Pure function to determine media type from file.
 */
export function getMediaType(file: File): 'image' | 'video' | 'file' {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'file';
}

/**
 * Pure function to create optimistic image payload.
 */
export function createOptimisticImagePayload(file: File, previewUrl: string) {
    return {
        src: previewUrl,
        alt: file.name,
        status: 'uploading' as const,
    };
}

/**
 * Pure function to create optimistic video payload.
 */
export function createOptimisticVideoPayload(file: File, previewUrl: string) {
    return {
        src: previewUrl,
        provider: 'html5' as const,
        title: file.name,
        status: 'uploading' as const,
    };
}

/**
 * Pure function to create optimistic file payload.
 */
export function createOptimisticFilePayload(file: File, previewUrl: string) {
    return {
        url: previewUrl,
        filename: file.name,
        size: file.size,
        mime: file.type,
        status: 'uploading' as const,
    };
}

/**
 * Hook for handling slash menu media uploads.
 */
export function useSlashUpload(
    editor: LexicalEditor | null,
    mediaConfig: EditorMediaConfig | null,
) {
    const uploadImage = useCallback(
        (file: File, onComplete?: () => void) => {
            if (!editor || !mediaConfig?.uploadAdapter) return;

            mediaConfig.callbacks?.onUploadStart?.(file, 'image');
            const previewUrl = URL.createObjectURL(file);

            editor.update(() => {
                const imageNode = $createImageBlockNode(
                    createOptimisticImagePayload(file, previewUrl),
                );
                $insertNodes([imageNode]);
                if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
                    $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
                }
            });

            onComplete?.();
        },
        [editor, mediaConfig],
    );

    const uploadVideo = useCallback(
        (file: File, onComplete?: () => void) => {
            if (!editor || !mediaConfig?.uploadAdapter) return;

            mediaConfig.callbacks?.onUploadStart?.(file, 'video');
            const previewUrl = URL.createObjectURL(file);

            editor.update(() => {
                const videoNode = $createVideoBlockNode(
                    createOptimisticVideoPayload(file, previewUrl),
                );
                $insertNodeToNearestRoot(videoNode);

                const paragraphNode = $createParagraphNode();
                videoNode.insertAfter(paragraphNode);
                paragraphNode.select();
            });

            onComplete?.();
        },
        [editor, mediaConfig],
    );

    const uploadFile = useCallback(
        (file: File, onComplete?: () => void) => {
            if (!editor || !mediaConfig?.uploadAdapter) return;

            mediaConfig.callbacks?.onUploadStart?.(file, 'file');
            const previewUrl = URL.createObjectURL(file);

            editor.update(() => {
                const fileNode = $createFileBlockNode(
                    createOptimisticFilePayload(file, previewUrl),
                );
                $insertNodes([fileNode]);
                if ($isRootOrShadowRoot(fileNode.getParentOrThrow())) {
                    $wrapNodeInElement(fileNode, $createParagraphNode).selectEnd();
                }
            });

            onComplete?.();
        },
        [editor, mediaConfig],
    );

    return { uploadImage, uploadVideo, uploadFile, getMediaType };
}
