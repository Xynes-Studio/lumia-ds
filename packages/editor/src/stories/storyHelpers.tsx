import React, { useState } from 'react';
import { LumiaEditor } from '../lumia-editor';
import type { LumiaEditorStateJSON } from '../types';
import type { EditorMediaConfig } from '../media-config';

/**
 * Shared wrapper component for stories that need state management.
 * Displays the editor with optional JSON viewer.
 */
export const EditorWithState = ({
  initialValue,
  showJson = true,
  media,
}: {
  initialValue?: LumiaEditorStateJSON;
  showJson?: boolean;
  media?: EditorMediaConfig;
}) => {
  const [value, setValue] = useState<LumiaEditorStateJSON | null>(
    initialValue || null,
  );

  return (
    <div className="max-w-4xl mx-auto">
      <LumiaEditor value={value} onChange={setValue} media={media} />
      {showJson && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-500">
            View JSON
          </summary>
          <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-64">
            {JSON.stringify(value, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

/**
 * Creates a mock media config for upload stories.
 */
export const createMockMediaConfig = (
  uploadDelay = 2000,
): EditorMediaConfig => ({
  uploadAdapter: {
    uploadFile: async (file: File) => {
      console.log('Uploading file:', file.name);
      await new Promise((resolve) => setTimeout(resolve, uploadDelay));
      const mockUrl = URL.createObjectURL(file);
      console.log('Upload complete:', mockUrl);
      return {
        url: mockUrl,
        mime: file.type,
        size: file.size,
      };
    },
  },
  callbacks: {
    onUploadStart: (file, type) =>
      console.log(`Upload started: ${file.name} (${type})`),
    onUploadComplete: (file, result) =>
      console.log(`Upload complete: ${file.name} -> ${result.url}`),
    onUploadError: (file, error) =>
      console.error(`Upload failed: ${file.name}`, error),
  },
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedVideoTypes: ['video/mp4', 'video/webm'],
  maxFileSizeMB: 100,
});
