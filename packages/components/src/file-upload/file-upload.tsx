import type { ChangeEvent, DragEvent, KeyboardEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../button/button';
import { cn } from '../lib/utils';

export type UploadedFile = {
  name: string;
  size: number;
  [key: string]: unknown;
};

export type FileUploadProps = {
  files: (File | UploadedFile)[];
  onChange: (files: (File | UploadedFile)[]) => void;
  multiple?: boolean;
  accept?: string;
  className?: string;
  emptyLabel?: string;
  buttonLabel?: string;
};

const formatFileSize = (bytes: number | undefined) => {
  if (!Number.isFinite(bytes) || bytes === undefined || bytes < 0) {
    return '0 B';
  }

  if (bytes < 1024) return `${bytes} B`;

  const units = ['KB', 'MB', 'GB', 'TB'];
  let size = bytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const rounded = size >= 10 ? Math.round(size) : Number(size.toFixed(1));

  return `${rounded} ${units[unitIndex]}`;
};

const getFileName = (file: File | UploadedFile, fallback: string) =>
  'name' in file ? file.name : fallback;

const getFileSize = (file: File | UploadedFile) =>
  'size' in file && Number.isFinite(file.size) ? file.size : 0;

export const FileUpload = ({
  files,
  onChange,
  multiple = false,
  accept,
  className,
  emptyLabel = 'No files selected',
  buttonLabel = multiple ? 'Upload files' : 'Upload file',
}: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = (incoming: File[]) => {
    if (incoming.length === 0) return;

    const nextFiles = multiple
      ? [...files, ...incoming]
      : [incoming[incoming.length - 1]];

    onChange(nextFiles);
  };

  const handleSelectFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    addFiles(selectedFiles);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(event.dataTransfer?.files ?? []);
    addFiles(droppedFiles);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      inputRef.current?.click();
    }
  };

  const handleRemoveFile = (index: number) => {
    const nextFiles = files.filter((_, position) => position !== index);
    onChange(nextFiles);
  };

  const fileItems = useMemo(
    () =>
      files.map((file, index) => {
        const name = getFileName(file, `File ${index + 1}`);
        const size = getFileSize(file);
        const key = `${name}-${size}-${index}`;
        const isImageFile =
          file instanceof File && file.type.startsWith('image/');
        const castFile = file as UploadedFile & { previewUrl?: unknown };
        const providedPreview =
          !isImageFile && typeof castFile.previewUrl === 'string'
            ? castFile.previewUrl
            : undefined;

        const previewUrl =
          isImageFile && typeof URL !== 'undefined' && URL.createObjectURL
            ? URL.createObjectURL(file)
            : providedPreview;

        return {
          key,
          name,
          size,
          index,
          previewUrl,
          shouldRevoke: Boolean(previewUrl && isImageFile),
        };
      }),
    [files],
  );

  useEffect(() => {
    const urlsToRevoke = fileItems
      .filter((item) => item.shouldRevoke && item.previewUrl)
      .map((item) => item.previewUrl as string);

    return () => {
      urlsToRevoke.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [fileItems]);

  return (
    <div className={cn('space-y-3', className)}>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple={multiple}
        accept={accept}
        onChange={handleSelectFiles}
      />

      <div
        role="button"
        tabIndex={0}
        data-testid="file-upload-dropzone"
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-5 text-center transition',
          'border-border bg-muted/40 hover:border-primary hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          isDragging && 'border-primary bg-primary/5',
        )}
      >
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            Drag and drop files here
          </p>
          <p className="text-xs text-muted-foreground">
            Images show a quick preview.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            inputRef.current?.click();
          }}
        >
          {buttonLabel}
        </Button>
      </div>

      <div className="space-y-2">
        {fileItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          fileItems.map(({ key, name, size, index, previewUrl }) => (
            <div
              key={key}
              className="flex items-center justify-between gap-3 rounded-md border border-dashed border-border bg-muted/50 px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-3">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt=""
                    className="h-10 w-10 rounded-sm object-cover ring-1 ring-border"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-muted text-xs font-semibold text-muted-foreground ring-1 ring-border">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(size)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={() => handleRemoveFile(index)}
              >
                Remove
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
