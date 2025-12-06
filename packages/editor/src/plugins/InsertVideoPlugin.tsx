import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils';
import {
  $createParagraphNode,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand,
} from 'lexical';
import { useEffect } from 'react';
import {
  $createVideoBlockNode,
  VideoBlockNode,
  VideoBlockPayload,
  VideoProvider,
} from '../nodes/VideoBlockNode';

export const INSERT_VIDEO_BLOCK_COMMAND: LexicalCommand<VideoBlockPayload> =
  createCommand('INSERT_VIDEO_BLOCK_COMMAND');

// Regex patterns for provider detection
const YOUTUBE_REGEX =
  /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
const VIMEO_REGEX =
  /(?:https?:)?\/\/(?:www\.)?(?:player\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^/]*)\/videos\/|video\/|)(\d+)/;
const LOOM_REGEX =
  /^(?:https?:\/\/)?(?:www\.)?loom\.com\/(?:share|embed)\/([a-f0-9]+)(?:\?.*)?$/;

/**
 * Detects the video provider from a URL.
 * Returns undefined if no known provider is detected.
 * Note: Order matters - check more specific providers first.
 */
export function detectVideoProvider(url: string): VideoProvider | undefined {
  const trimmedUrl = url.trim();

  // Check Loom first (specific domain)
  if (LOOM_REGEX.test(trimmedUrl)) {
    return 'loom';
  }

  // Check Vimeo (specific domain)
  if (VIMEO_REGEX.test(trimmedUrl)) {
    return 'vimeo';
  }

  // Check YouTube (broader matching, check after more specific patterns)
  if (YOUTUBE_REGEX.test(trimmedUrl)) {
    return 'youtube';
  }

  // Check for common video file extensions for html5
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmedUrl)) {
    return 'html5';
  }

  return undefined;
}

/**
 * InsertVideoPlugin - Handles the INSERT_VIDEO_BLOCK_COMMAND to insert VideoBlockNode.
 *
 * Used by the VideoToolbarButton and slash menu to insert video blocks.
 * Automatically detects the provider if not explicitly provided.
 */
export function InsertVideoPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([VideoBlockNode])) {
      throw new Error(
        'InsertVideoPlugin: VideoBlockNode not registered on editor',
      );
    }

    return mergeRegister(
      editor.registerCommand<VideoBlockPayload>(
        INSERT_VIDEO_BLOCK_COMMAND,
        (payload) => {
          const { src, provider, title } = payload;

          // Auto-detect provider if not provided
          const resolvedProvider = provider || detectVideoProvider(src);

          const videoNode = $createVideoBlockNode({
            src,
            provider: resolvedProvider,
            title: title || 'Embedded Video',
          });

          // Insert at nearest root level
          $insertNodeToNearestRoot(videoNode);

          // Add a paragraph after so user can continue typing
          const paragraphNode = $createParagraphNode();
          videoNode.insertAfter(paragraphNode);
          paragraphNode.select();

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    );
  }, [editor]);

  return null;
}
