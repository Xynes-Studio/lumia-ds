import React from 'react';
import { File as FileIcon } from 'lucide-react';
import { Card } from '@lumia-ui/components';

export interface FileBlockProps {
  node: {
    url: string;
    filename: string;
    size?: number;
    mime?: string;
    [key: string]: unknown;
  };
}

export const FileBlock: React.FC<FileBlockProps> = ({ node }) => {
  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  };

  return (
    <Card
      className="flex items-center p-3 gap-3 hover:bg-gray-50 transition-colors cursor-pointer group"
      onClick={() => window.open(node.url, '_blank')}
    >
      <div className="bg-gray-100 p-2 rounded text-gray-600 group-hover:bg-white group-hover:text-blue-500 transition-colors">
        <FileIcon size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{node.filename}</div>
        {node.size && (
          <div className="text-xs text-gray-500">{formatSize(node.size)}</div>
        )}
      </div>
    </Card>
  );
};
