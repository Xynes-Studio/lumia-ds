import type { ChangeEvent } from 'react';
import { useMemo, useRef } from 'react';
import { Button } from './button';
import { cn } from './utils';

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

  const handleSelectFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length === 0) return;

    const nextFiles = multiple
      ? [...files, ...selectedFiles]
      : [selectedFiles[selectedFiles.length - 1]];

    onChange(nextFiles);
    event.target.value = '';
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

        return { key, name, size, index };
      }),
    [files],
  );

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

      <Button
        type="button"
        variant="secondary"
        onClick={() => inputRef.current?.click()}
      >
        {buttonLabel}
      </Button>

      <div className="space-y-2">
        {fileItems.length === 0 ? (
          <p className="text-sm text-muted">{emptyLabel}</p>
        ) : (
          fileItems.map(({ key, name, size, index }) => (
            <div
              key={key}
              className="flex items-center justify-between gap-3 rounded-md border border-dashed border-border bg-muted/50 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {name}
                </p>
                <p className="text-xs text-muted">{formatFileSize(size)}</p>
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
