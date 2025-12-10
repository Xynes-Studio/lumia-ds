import React from 'react';
import {
  IS_BOLD,
  IS_ITALIC,
  IS_STRIKETHROUGH,
  IS_UNDERLINE,
  IS_CODE,
  IS_SUBSCRIPT,
  IS_SUPERSCRIPT,
} from '../../utils';

export const TextRenderer = ({
  node,
}: {
  node: { text: string; format?: number; [key: string]: unknown };
}) => {
  const format = (node.format as number) || 0;
  let content: React.ReactNode = node.text;

  if (format & IS_BOLD) content = <strong>{content}</strong>;
  if (format & IS_ITALIC) content = <em>{content}</em>;
  if (format & IS_STRIKETHROUGH)
    content = <span className="line-through">{content}</span>;
  if (format & IS_UNDERLINE)
    content = <span className="underline">{content}</span>;
  if (format & IS_CODE)
    content = (
      <code className="font-mono bg-gray-100 rounded px-1 text-sm">
        {content}
      </code>
    );
  if (format & IS_SUBSCRIPT) content = <sub>{content}</sub>;
  if (format & IS_SUPERSCRIPT) content = <sup>{content}</sup>;

  return <>{content}</>;
};
