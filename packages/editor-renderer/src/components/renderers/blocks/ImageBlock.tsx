import React from 'react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ImageBlockProps {
  node: {
    src: string;
    alt?: string;
    caption?: string;
    layout?: 'inline' | 'breakout' | 'fullWidth';
    width?: number;
    height?: number;
    [key: string]: unknown;
  };
}

export const ImageBlock: React.FC<ImageBlockProps> = ({ node }) => {
  const { src, alt, caption, layout, width, height } = node;

  const layoutClasses = {
    inline: 'w-full max-w-2xl mx-auto',
    breakout: 'w-full max-w-4xl mx-auto',
    fullWidth: 'w-full',
  };

  const containerClass = layout ? layoutClasses[layout] : layoutClasses.inline;

  return (
    <div className={cn('my-6', containerClass)}>
      <img
        src={src}
        alt={alt || 'Image'}
        width={width}
        height={height}
        className="w-full h-auto rounded-lg shadow-sm"
        loading="lazy"
      />
      {caption && (
        <div className="mt-2 text-center text-sm text-gray-500">{caption}</div>
      )}
    </div>
  );
};
