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
import { useEffect, useRef } from 'react';
import { Card } from '@lumia/components';
import { $isVideoBlockNode, VideoProvider } from './VideoBlockNode';

export interface VideoBlockComponentProps {
  src: string;
  provider?: VideoProvider;
  title?: string;
  nodeKey: NodeKey;
}

export function VideoBlockComponent({
  src,
  provider = 'html5',
  title,
  nodeKey,
}: VideoBlockComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelected] =
    useLexicalNodeSelection(nodeKey);
  const videoRef = useRef<HTMLVideoElement | HTMLIFrameElement>(null);

  const onDelete = React.useCallback(
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

  if (!src) {
    return (
      <Card className="p-4 w-full max-w-md mx-auto flex flex-col items-center gap-4 border-dashed">
        <div className="text-muted-foreground text-sm">
          No video source provided
        </div>
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
          className="w-full h-full rounded-md"
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
        className="w-full h-full rounded-md"
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
        {/* Overlay to capture clicks for selection when using iframes */}
        {!isSelected && (
          <div
            className="absolute inset-0 bg-transparent cursor-pointer"
            onClick={handleClick}
          />
        )}
      </Card>
    </div>
  );
}
