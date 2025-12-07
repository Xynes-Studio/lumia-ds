import React from 'react';
import { Card } from '@lumia/components';

export interface VideoBlockProps {
  node: {
    src: string;
    provider?: 'youtube' | 'vimeo' | 'loom' | 'html5';
    title?: string;
  };
}

export const VideoBlock: React.FC<VideoBlockProps> = ({ node }) => {
  const { src, provider = 'html5', title } = node;

  if (!src) {
    return (
      <Card className="p-4 w-full max-w-md mx-auto flex flex-col items-center gap-4 border-dashed">
        <div className="text-gray-500 text-sm">No video source provided</div>
      </Card>
    );
  }

  const renderVideo = () => {
    if (provider === 'html5') {
      return (
        <video
          src={src}
          controls
          className="w-full h-full rounded-md"
          title={title}
        />
      );
    }

    let embedSrc = src;
    if (provider === 'youtube') {
      if (src.includes('watch?v=')) {
        embedSrc = src.replace('watch?v=', 'embed/');
      } else if (src.includes('youtu.be/')) {
        embedSrc = src.replace('youtu.be/', 'youtube.com/embed/');
      }
    } else if (provider === 'vimeo') {
      if (!src.includes('player.vimeo.com')) {
        const vimeoId = src.split('/').pop();
        if (vimeoId) {
          embedSrc = `https://player.vimeo.com/video/${vimeoId}`;
        }
      }
    }

    return (
      <iframe
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
    <div className="video-block-container py-4">
      <Card className="w-full max-w-3xl mx-auto aspect-video overflow-hidden">
        {renderVideo()}
      </Card>
    </div>
  );
};
