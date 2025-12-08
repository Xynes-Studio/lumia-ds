import React, { useState, useRef, useCallback } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Button,
  Input,
} from '@lumia/components';
import { Upload, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useMediaContext } from '../../EditorProvider';

export type MediaType = 'image' | 'video';

export interface MediaInsertTabsProps {
  /** The type of media being inserted */
  mediaType: MediaType;
  /** Called when user wants to insert from a URL */
  onInsertFromUrl: (url: string, metadata?: { alt?: string }) => void;
  /** Called when user selects a file to upload */
  onInsertFromFile: (file: File) => void;
  /** Called when user cancels the operation */
  onCancel: () => void;
  /** Optional placeholder for URL input */
  urlPlaceholder?: string;
  /** Whether URL input should show alt text field (for images) */
  showAltText?: boolean;
}

/**
 * MediaInsertTabs - A shared tabbed component for inserting media via link or upload.
 *
 * Provides two tabs:
 * - Link: Enter a URL directly
 * - Upload: Select a file from device
 *
 * Uses MediaContext to determine if upload is available and what file types are allowed.
 */
export function MediaInsertTabs({
  mediaType,
  onInsertFromUrl,
  onInsertFromFile,
  onCancel,
  urlPlaceholder,
  showAltText = false,
}: MediaInsertTabsProps) {
  const [activeTab, setActiveTab] = useState<string>('link');
  const [url, setUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaConfig = useMediaContext();

  const uploadEnabled = Boolean(mediaConfig?.uploadAdapter);
  const acceptedTypes =
    mediaType === 'image'
      ? mediaConfig?.allowedImageTypes
      : mediaConfig?.allowedVideoTypes;

  const handleInsertFromUrl = useCallback(() => {
    if (!url) return;
    onInsertFromUrl(url, showAltText ? { alt: altText } : undefined);
  }, [url, altText, showAltText, onInsertFromUrl]);

  const handleFileSelect = useCallback(
    async (file: File) => {
      // Validate type
      if (acceptedTypes && !acceptedTypes.includes(file.type)) {
        alert(`File type ${file.type} not allowed`);
        return;
      }

      // Validate size
      if (
        mediaConfig?.maxFileSizeMB &&
        file.size > mediaConfig.maxFileSizeMB * 1024 * 1024
      ) {
        alert(`File size exceeds ${mediaConfig.maxFileSizeMB}MB`);
        return;
      }

      setIsUploading(true);
      onInsertFromFile(file);
    },
    [acceptedTypes, mediaConfig?.maxFileSizeMB, onInsertFromFile],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const getPlaceholder = () => {
    if (urlPlaceholder) return urlPlaceholder;
    return mediaType === 'image'
      ? 'https://example.com/image.jpg'
      : 'https://youtube.com/watch?v=...';
  };

  return (
    <div className="w-80">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="link" className="flex-1 gap-2">
            <LinkIcon className="h-4 w-4" />
            Embed link
          </TabsTrigger>
          {uploadEnabled && (
            <TabsTrigger value="upload" className="flex-1 gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="link" className="mt-4">
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <label
                htmlFor="media-url"
                className="text-sm font-medium text-foreground"
              >
                {mediaType === 'image' ? 'Image URL' : 'Video URL'}
              </label>
              <Input
                id="media-url"
                placeholder={getPlaceholder()}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInsertFromUrl();
                  }
                }}
                autoFocus
              />
              {mediaType === 'video' && (
                <p className="text-xs text-muted-foreground">
                  Supports YouTube, Vimeo, Loom, and direct video files
                </p>
              )}
            </div>

            {showAltText && (
              <div className="space-y-2">
                <label
                  htmlFor="media-alt"
                  className="text-sm font-medium text-foreground"
                >
                  Alt Text
                </label>
                <Input
                  id="media-alt"
                  placeholder="Description of the image"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleInsertFromUrl();
                    }
                  }}
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleInsertFromUrl} disabled={!url}>
                Insert
              </Button>
            </div>
          </div>
        </TabsContent>

        {uploadEnabled && (
          <TabsContent value="upload" className="mt-4">
            <div className="flex flex-col gap-4">
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptedTypes?.join(',')}
                  onChange={handleFileChange}
                  className="sr-only"
                  data-testid={`${mediaType}-upload-input`}
                />

                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Uploading...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Drag and drop or{' '}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-primary hover:underline font-medium"
                      >
                        choose file
                      </button>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {mediaType === 'image'
                        ? 'PNG, JPG, GIF, WebP up to'
                        : 'MP4, WebM up to'}{' '}
                      {mediaConfig?.maxFileSizeMB || 5}MB
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
