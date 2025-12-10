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
import { FileIcon, Download, Upload, RefreshCw, Trash2 } from 'lucide-react';
import { $isFileBlockNode } from './FileBlockNode';
import { useMediaContext } from '../../EditorProvider';

export interface FileBlockComponentProps {
  url: string;
  filename: string;
  size?: number;
  mime?: string;
  status?: 'uploading' | 'uploaded' | 'error';
  nodeKey: NodeKey;
}

export function FileBlockComponent({
  url,
  filename,
  size,
  status,
  nodeKey,
}: FileBlockComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelected] =
    useLexicalNodeSelection(nodeKey);
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaConfig = useMediaContext();

  const onDelete = React.useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isFileBlockNode($getNodeByKey(nodeKey))) {
        const event: KeyboardEvent = payload;
        event.preventDefault();
        const node = $getNodeByKey(nodeKey);
        if ($isFileBlockNode(node)) {
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
          if (
            cardRef.current &&
            cardRef.current.contains(event.target as Node)
          ) {
            // Allow default click behavior for links/buttons inside the card
            if (
              (event.target as HTMLElement).closest('a') ||
              (event.target as HTMLElement).closest('button')
            ) {
              return false;
            }

            if (event.shiftKey) {
              setSelected(!isSelected);
            } else {
              clearSelected();
              setSelected(true);
            }
            return true;
          }
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !mediaConfig?.uploadAdapter) return;

    // Call onUploadStart callback
    mediaConfig.callbacks?.onUploadStart?.(file, 'file');

    // Validate size
    if (
      mediaConfig.maxFileSizeMB &&
      file.size > mediaConfig.maxFileSizeMB * 1024 * 1024
    ) {
      alert(`File size exceeds ${mediaConfig.maxFileSizeMB}MB`);
      return;
    }

    // Optimistic preview
    const previewUrl = URL.createObjectURL(file);
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isFileBlockNode(node)) {
        const writable = node.getWritable();
        writable.__url = previewUrl;
        writable.__filename = file.name;
        writable.__size = file.size;
        writable.__mime = file.type;
        writable.__status = 'uploading';
      }
    });

    try {
      const result = await mediaConfig.uploadAdapter.uploadFile(file, {
        onProgress: (progress) => {
          mediaConfig.callbacks?.onUploadProgress?.(file, progress);
        },
      });
      mediaConfig.callbacks?.onUploadComplete?.(file, result);
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isFileBlockNode(node)) {
          const writable = node.getWritable();
          writable.__url = result.url;
          writable.__filename = file.name; // Keep original filename or use result?
          writable.__size = result.size;
          writable.__mime = result.mime;
          writable.__status = 'uploaded';
        }
      });
    } catch (error) {
      console.error('Upload failed:', error);
      mediaConfig.callbacks?.onUploadError?.(
        file,
        error instanceof Error ? error : new Error('Upload failed'),
      );
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isFileBlockNode(node)) {
          const writable = node.getWritable();
          writable.__status = 'error';
        }
      });
    }
  };

  const handleRetry = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isFileBlockNode(node)) {
        node.remove();
      }
    });
  };

  const formatSize = (bytes?: number) => {
    if (bytes === undefined) return '';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const showUpload = !url && mediaConfig?.uploadAdapter;
  const isUploading = status === 'uploading';
  const isError = status === 'error';

  if (showUpload) {
    return (
      <div className="file-block-container my-4">
        <Card className="p-4 w-full max-w-md mx-auto flex flex-col items-center gap-4 border-dashed">
          <div className="text-muted-foreground text-sm">Upload a file</div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleUpload}
            className="sr-only"
            data-testid="file-upload-input"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="file-block-container my-4">
      <Card
        ref={cardRef}
        className={`flex items-center p-3 gap-3 transition-all duration-200 border ${
          isSelected
            ? 'ring-2 ring-primary ring-offset-2 border-primary'
            : 'hover:bg-muted/50'
        } max-w-md relative`}
      >
        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
          {isUploading ? (
            <RefreshCw className="h-5 w-5 text-muted-foreground animate-spin" />
          ) : isError ? (
            <FileIcon className="h-5 w-5 text-destructive" />
          ) : (
            <FileIcon className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium truncate ${isError ? 'text-destructive' : ''}`}
            title={filename}
          >
            {isError ? 'Upload Failed' : filename}
          </p>
          {size !== undefined && !isError && (
            <p className="text-xs text-muted-foreground">{formatSize(size)}</p>
          )}
          {isError && (
            <p className="text-xs text-destructive">Please retry or remove</p>
          )}
        </div>

        {isError ? (
          <div className="flex gap-1">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleUpload}
              className="sr-only"
            />
            <button
              onClick={handleRetry}
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Retry"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={handleRemove}
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-destructive/10 text-destructive hover:text-destructive transition-colors"
              title="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <a
            href={url}
            download={filename}
            className={`h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            title="Download"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download className="h-4 w-4" />
          </a>
        )}
      </Card>
    </div>
  );
}
