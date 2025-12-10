import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  PASTE_COMMAND,
} from 'lexical';
import { $insertNodeToNearestRoot } from '@lexical/utils';
import { useEffect } from 'react';
import { $createVideoBlockNode, VideoProvider } from '../nodes/VideoBlockNode';

const YOUTUBE_REGEX =
  /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
const VIMEO_REGEX =
  /(?:https?:)?\/\/(?:www\.)?(?:player\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^/]*)\/videos\/|video\/|)(\d+)/;
const LOOM_REGEX =
  /^(?:https?:\/\/)?(?:www\.)?loom\.com\/(?:share|embed)\/([a-f0-9]+)(?:\?.*)?$/;

/**
 * AutoEmbedVideoPlugin - Automatically converts pasted video URLs into VideoBlockNode embeds.
 *
 * Supports YouTube, Vimeo, and Loom URLs. When a user pastes a valid video URL,
 * this plugin intercepts the paste command and inserts a VideoBlockNode instead of plain text.
 */
export const AutoEmbedVideoPlugin = (): null => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent) => {
        const clipboardData = event.clipboardData;
        if (!clipboardData) {
          return false;
        }

        const text = clipboardData.getData('text/plain');
        const trimmedText = text.trim();

        // Check if the pasted text is a single URL (no whitespace)
        if (/\s/.test(trimmedText)) {
          return false;
        }

        let provider: VideoProvider | undefined;

        if (YOUTUBE_REGEX.test(trimmedText)) {
          provider = 'youtube';
        } else if (VIMEO_REGEX.test(trimmedText)) {
          provider = 'vimeo';
        } else if (LOOM_REGEX.test(trimmedText)) {
          provider = 'loom';
        }

        if (provider) {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              const videoNode = $createVideoBlockNode({
                src: trimmedText,
                provider,
                title: 'Embedded Video',
              });

              // Insert the video block at the nearest root level
              $insertNodeToNearestRoot(videoNode);

              // Insert a paragraph below so the user can continue typing
              const paragraphNode = $createParagraphNode();
              videoNode.insertAfter(paragraphNode);
              paragraphNode.select();
            }
          });
          event.preventDefault();
          return true;
        }

        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor]);

  return null;
};
